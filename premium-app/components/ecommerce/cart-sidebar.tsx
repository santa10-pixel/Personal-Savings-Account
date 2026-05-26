"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/lib/store";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [status, setStatus] = useState<"idle" | "processing" | "processing_mock" | "success">("idle");

  const handlePayment = async () => {
    setStatus("processing");
    
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ 
            id: item.product.id, 
            quantity: item.quantity,
            price: item.product.discountedPrice,
            name: item.product.title,
            image: item.product.images[0]
          })),
          totalAmount: total,
          customerName: "Guest User",
        })
      });
      
      const data = await res.json();
      
      if (!data.orderId) throw new Error("Order creation failed");

      if (data.orderId.startsWith("mock_order_")) {
        // Open the simulated payment details modal
        setStatus("processing_mock");
        return;
      }

      const options = {
        key: "rzp_test_replace_me",
        amount: data.amount,
        currency: data.currency,
        name: "AURA.",
        description: "Premium Purchase",
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setStatus("success");
            clearCart();
            import("canvas-confetti").then((confetti) => {
              confetti.default({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999
              });
            });
          } else {
            setStatus("idle");
            alert("Payment verification failed");
          }
        },
        theme: { color: "#000000" }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        setStatus("idle");
        alert("Payment Failed");
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      setStatus("idle");
      alert("Something went wrong");
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.product.discountedPrice * item.quantity), 0);
  const taxes = subtotal * 0.18; // 18% GST for example
  const shipping = subtotal > 4000 || subtotal === 0 ? 0 : 199;
  const total = subtotal + taxes + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[70] flex w-full max-w-md flex-col bg-background shadow-2xl border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-heading text-2xl font-medium text-foreground flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" /> Shopping Cart
              </h2>
              <button 
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <ShoppingBag className="h-16 w-16 mb-4" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-24 w-20 overflow-hidden rounded-lg bg-secondary flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-foreground text-sm line-clamp-1">{item.product.title}</h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                        <p className="font-medium text-foreground mt-1">₹{item.product.discountedPrice}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-md border border-border">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-border p-6 bg-secondary/30">
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Estimated Taxes (18%)</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="mt-2 flex justify-between font-heading text-xl font-medium text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                disabled={items.length === 0 || status === "processing"}
                onClick={handlePayment}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-medium transition-all ${items.length === 0 ? "bg-foreground/50 text-background/50 cursor-not-allowed" : "bg-foreground text-background hover:bg-foreground/90"}`}
              >
                {status === "processing" ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <><ShieldCheck className="h-5 w-5" /> Secure Checkout</>
                )}
              </button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Powered by Razorpay
              </p>
            </div>
          </motion.div>

          {/* Mock Payment Gateway Modal */}
          <AnimatePresence>
            {status === "processing_mock" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[75] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: -20 }}
                  className="w-full max-w-sm rounded-3xl bg-secondary/80 p-6 shadow-2xl border border-border flex flex-col"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading text-xl font-medium">AURA. Checkout</h3>
                    <button onClick={() => setStatus("idle")} className="p-2 hover:bg-background rounded-full transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="bg-background rounded-2xl p-4 mb-6 border border-border flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Payable</span>
                    <span className="font-heading text-lg font-medium">₹{total.toFixed(2)}</span>
                  </div>

                  <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">Payment Method</p>
                  
                  <div className="space-y-3 mb-8">
                    <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-background cursor-pointer hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border border-accent flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-accent" />
                        </div>
                        <span className="font-medium text-sm">UPI (GPay, PhonePe)</span>
                      </div>
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </label>

                    <div className="px-2">
                      <input 
                        type="text" 
                        placeholder="Enter UPI ID (e.g. user@okhdfcbank)" 
                        className="w-full bg-background border-b border-border py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      setStatus("processing");
                      await new Promise(r => setTimeout(r, 1500));
                      
                      const verifyRes = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          razorpay_order_id: `mock_order_${Date.now()}`,
                          razorpay_payment_id: "mock_payment_id",
                          razorpay_signature: "mock_signature"
                        })
                      });
                      
                      const verifyData = await verifyRes.json();
                      if (verifyData.success) {
                        setStatus("success");
                        clearCart();
                        import("canvas-confetti").then((confetti) => {
                          confetti.default({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            zIndex: 9999
                          });
                        });
                      } else {
                        setStatus("idle");
                        alert("Payment verification failed");
                      }
                    }}
                    className="w-full py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors flex justify-center items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" /> Pay ₹{total.toFixed(2)} securely
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground mt-4">
                    This is a simulated payment gateway for testing.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Overlay within Sidebar */}
          <AnimatePresence>
            {status === "success" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 z-[80] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
              >
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="flex flex-col items-center text-center px-6"
                >
                  <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                    <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-heading text-2xl font-medium text-foreground mb-4">Payment Successful!</h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Your order is being processed.
                  </p>
                  <button onClick={() => { setStatus("idle"); onClose(); }} className="w-full bg-foreground text-background py-3 rounded-xl font-medium">
                    Continue Shopping
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
