import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Briefcase, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  professional_id: string;
  booking_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationAlertProps {
  professionalId: string;
}

const ALERT_DURATION = 5000; // 5 seconds ring

const NotificationAlert = ({ professionalId }: NotificationAlertProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeAlert, setActiveAlert] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create audio context for alert sound
  const playAlertSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (time: number, freq: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        oscillator.start(time);
        oscillator.stop(time + 0.3);
      };

      // Ring pattern: 5 seconds of beeps
      for (let i = 0; i < 10; i++) {
        playBeep(audioContext.currentTime + i * 0.5, i % 2 === 0 ? 880 : 1100);
      }
    } catch (e) {
      console.log("Audio alert not available");
    }
  }, []);

  // Fetch existing unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("is_read", false)
        .order("created_at", { ascending: false });
      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.length);
      }
    };
    fetchUnread();
  }, [professionalId]);

  // Realtime subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel(`notifications-${professionalId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `professional_id=eq.${professionalId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show active alert with ring
          setActiveAlert(newNotification);
          playAlertSound();

          // Auto-dismiss after 5 seconds
          if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
          alertTimerRef.current = setTimeout(() => {
            setActiveAlert(null);
          }, ALERT_DURATION);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [professionalId, playAlertSound]);

  const dismissAlert = () => {
    setActiveAlert(null);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("professional_id", professionalId)
      .eq("is_read", false);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-accent" : "text-muted-foreground"}`} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Full-screen Alert Overlay (Zomato-style) */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={dismissAlert}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card rounded-2xl border-2 border-accent shadow-2xl overflow-hidden"
            >
              {/* Pulsing header */}
              <motion.div
                animate={{ backgroundColor: ["hsl(var(--accent))", "hsl(var(--accent) / 0.7)", "hsl(var(--accent))"] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="p-4 flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Bell className="w-8 h-8 text-accent-foreground" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-accent-foreground font-bold text-lg">New Job Alert! 🎉</p>
                  <p className="text-accent-foreground/80 text-xs">You have a new hiring request</p>
                </div>
                <button onClick={dismissAlert} className="text-accent-foreground/60 hover:text-accent-foreground">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>

              <div className="p-5 space-y-3">
                <h3 className="font-display font-bold text-foreground text-lg">{activeAlert.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{activeAlert.message}</p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                    onClick={() => {
                      dismissAlert();
                      setShowPanel(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      markAsRead(activeAlert.id);
                      dismissAlert();
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-border">
                <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-accent hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto max-h-72">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationAlert;
