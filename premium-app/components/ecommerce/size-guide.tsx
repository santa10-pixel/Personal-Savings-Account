"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-card/90 p-8 shadow-2xl backdrop-blur-xl border border-border"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8">
              <h2 className="font-heading text-3xl font-medium text-foreground">Size Guide</h2>
              <p className="mt-2 text-sm text-muted-foreground">Find your perfect fit. Measurements are in inches.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-background/50">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary text-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Chest</th>
                    <th className="px-6 py-4">Waist</th>
                    <th className="px-6 py-4">Hips</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground divide-y divide-border">
                  <tr className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">S</td>
                    <td className="px-6 py-4">34 - 36</td>
                    <td className="px-6 py-4">28 - 30</td>
                    <td className="px-6 py-4">35 - 37</td>
                  </tr>
                  <tr className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">M</td>
                    <td className="px-6 py-4">38 - 40</td>
                    <td className="px-6 py-4">32 - 34</td>
                    <td className="px-6 py-4">39 - 41</td>
                  </tr>
                  <tr className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">L</td>
                    <td className="px-6 py-4">42 - 44</td>
                    <td className="px-6 py-4">36 - 38</td>
                    <td className="px-6 py-4">43 - 45</td>
                  </tr>
                  <tr className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">XL</td>
                    <td className="px-6 py-4">46 - 48</td>
                    <td className="px-6 py-4">40 - 42</td>
                    <td className="px-6 py-4">47 - 49</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="mt-6 text-xs text-muted-foreground text-center">
              If you are between sizes, we recommend sizing up for a more relaxed fit.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
