import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User } from 'firebase/auth';
import { UserStat } from '../App';

interface AddModalProps {
  type: 'rejection' | 'success';
  onClose: () => void;
  user: User;
  userStat: UserStat | null;
}

export default function AddModal({ type, onClose, user, userStat }: AddModalProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (type === 'rejection') {
        // Add rejection
        await addDoc(collection(db, 'rejections'), {
          text: text.trim(),
          createdAt: serverTimestamp(),
          userId: user.uid
        });

        // Update count
        if (userStat) {
          await updateDoc(doc(db, 'userStats', user.uid), {
            rejectionCount: (userStat.rejectionCount || 0) + 1
          });
        }
      } else {
        // Add success
        await addDoc(collection(db, 'successes'), {
          text: text.trim(),
          createdAt: serverTimestamp(),
          userId: user.uid
        });

        // Update shattered state
        if (userStat) {
          await updateDoc(doc(db, 'userStats', user.uid), {
            isShattered: true
          });
        }
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, type === 'rejection' ? 'rejections' : 'successes');
      setIsSubmitting(false);
    }
  };

  const isRejection = type === 'rejection';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#112240] border border-[#233554] rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className={`text-2xl font-serif mb-2 ${isRejection ? 'text-yellow-400' : 'text-emerald-400'}`}>
          {isRejection ? 'Record a Rejection' : 'Celebrate a Success'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isRejection 
            ? "What did you try today? Every 'No' brings you closer to a 'Yes'." 
            : "What breakthrough did you achieve? It's time to break the jar."}
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isRejection ? "e.g., Applied for a senior role and got rejected..." : "e.g., Finally got the offer!"}
            className="w-full bg-[#0A192F] border border-[#233554] rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 resize-none h-32 mb-6"
            maxLength={500}
            autoFocus
          />
          
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              !text.trim() || isSubmitting 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : isRejection 
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-[#0A192F]' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-[#0A192F]'
            }`}
          >
            {isSubmitting ? 'Saving...' : isRejection ? 'Add to Jar' : 'Break the Jar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
