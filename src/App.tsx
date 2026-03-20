import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, LogOut, Star as StarIcon, CheckCircle, Sparkles } from 'lucide-react';

// Components
import JarView from './components/JarView';
import SkyView from './components/SkyView';
import AddModal from './components/AddModal';

export interface Rejection {
  id: string;
  text: string;
  createdAt: any;
  userId: string;
}

export interface UserStat {
  rejectionCount: number;
  isShattered: boolean;
  userId: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [userStat, setUserStat] = useState<UserStat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'rejection' | 'success'>('rejection');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    // Test connection
    const testConnection = async () => {
      try {
        await getDoc(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Listen to rejections
    const rejectionsRef = collection(db, 'rejections');
    const q = query(rejectionsRef);
    const unsubRejections = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .filter(doc => doc.data().userId === user.uid)
        .map(doc => ({ id: doc.id, ...doc.data() } as Rejection));
      setRejections(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'rejections');
    });

    // Listen to user stats
    const statRef = doc(db, 'userStats', user.uid);
    const unsubStat = onSnapshot(statRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserStat(docSnap.data() as UserStat);
      } else {
        // Initialize user stat
        setDoc(statRef, {
          rejectionCount: 0,
          isShattered: false,
          userId: user.uid
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `userStats/${user.uid}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `userStats/${user.uid}`);
    });

    return () => {
      unsubRejections();
      unsubStat();
    };
  }, [user, isAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/crumpled-paper.png")' }}></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center max-w-md"
        >
          <h1 className="text-4xl font-serif mb-6 text-yellow-400">1000 Rejections</h1>
          <p className="text-lg mb-8 text-gray-300 leading-relaxed">
            "被拒绝不是失败，是你拥有尝试勇气的证明。" <br/><br/>
            DELETE your fear of rejection.
          </p>
          <button 
            onClick={signInWithGoogle}
            className="bg-yellow-500 hover:bg-yellow-400 text-[#0A192F] font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const isShattered = userStat?.isShattered || false;

  return (
    <div className="min-h-screen bg-[#0A192F] text-white relative overflow-hidden font-sans">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/crumpled-paper.png")' }}></div>
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <StarIcon className="text-yellow-400" size={24} />
          <span className="font-serif text-xl tracking-wider">Courage</span>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <LogOut size={16} /> Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="relative w-full h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isShattered ? (
            <motion.div key="jar" className="w-full h-full" exit={{ opacity: 0 }}>
              <JarView rejections={rejections} count={userStat?.rejectionCount || 0} />
            </motion.div>
          ) : (
            <motion.div key="sky" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SkyView rejections={rejections} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Buttons */}
      {!isShattered && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 z-50">
          <button 
            onClick={() => { setModalType('rejection'); setIsModalOpen(true); }}
            className="group flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-[#0A192F] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all transform hover:scale-110">
              <Plus size={28} />
            </div>
            <span className="text-xs text-gray-400 group-hover:text-yellow-400 transition-colors uppercase tracking-widest">Add Rejection</span>
          </button>
          
          <button 
            onClick={() => { setModalType('success'); setIsModalOpen(true); }}
            className="group flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-[#0A192F] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-110">
              <Sparkles size={28} />
            </div>
            <span className="text-xs text-gray-400 group-hover:text-emerald-400 transition-colors uppercase tracking-widest">Record Success</span>
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddModal 
            type={modalType} 
            onClose={() => setIsModalOpen(false)} 
            user={user}
            userStat={userStat}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
