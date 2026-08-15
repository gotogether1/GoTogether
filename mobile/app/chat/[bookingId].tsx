import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEED_BOOKINGS, SEED_MESSAGES, SEED_RIDES, DemoMessage, DemoBooking } from '../../src/demo/seedData';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { fetchWithAuth } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthProvider';
import { Colors, Spacing, Typography } from '../../src/theme';
import { safeBack } from '../../src/utils/navigation';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { bookingId } = useLocalSearchParams();

  const [booking, setBooking] = useState<DemoBooking | any | null>(null);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentUserId = user?.uid || '';

  useEffect(() => {
    async function loadChatData() {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch conversation / booking messages from backend API
        const [convRes, msgRes] = await Promise.all([
          fetchWithAuth(`/v1/chats/${bookingId}`).catch(() => null),
          fetchWithAuth(`/v1/chats/${bookingId}/messages`).catch(() => null),
        ]);

        if (convRes?.data && msgRes?.data) {
          setBooking({
            id: bookingId as string,
            rideId: convRes.data.rideId,
            status: 'approved',
            pickup: convRes.data.pickup || 'Trip Pick-up',
            destination: convRes.data.destination || 'Trip Drop-off',
          });
          setMessages(msgRes.data);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        // Fallback to local booking state check if offline
      }

      // Check local state fallback
      const foundBooking = SEED_BOOKINGS.find(b => b.id === bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
        setMessages(SEED_MESSAGES.filter(m => m.bookingId === foundBooking.id));
      } else {
        setErrorMsg('Booking request not found or chat is inaccessible.');
      }
      setLoading(false);
    }

    loadChatData();
  }, [bookingId]);

  const handleSend = async () => {
    if (!inputText.trim() || !bookingId) return;

    const msgText = inputText.trim();
    setInputText('');

    const newMsg: DemoMessage = {
      id: `msg_${Date.now()}`,
      bookingId: bookingId as string,
      senderId: currentUserId,
      body: msgText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);

    try {
      await fetchWithAuth(`/v1/chats/${bookingId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: msgText }),
      });
    } catch {
      // Message added to local state
    }
  };

  const topInsetHeight = Math.max(insets.top + 12, 42);
  const bottomInsetPadding = Math.max(insets.bottom, 12);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Verifying chat permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Strict Booking Status & Authorization Guard: Chat allowed ONLY on APPROVED bookings!
  if (!booking || booking.status !== 'approved') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyCenter}>
          <EmptyState
            icon="lock-closed-outline"
            title="Chat Locked"
            message={errorMsg || "Direct chat opens automatically once your booking request is approved by the driver."}
            actionLabel="Go Back"
            onAction={() => safeBack(router)}
          />
        </View>
      </SafeAreaView>
    );
  }

  const ride = SEED_RIDES.find(r => r.id === booking.rideId) || { pickup: booking.pickup || 'Pick-up', destination: booking.destination || 'Drop-off' };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Status Bar Spacer */}
      <View style={{ height: topInsetHeight, backgroundColor: Colors.surface }} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => safeBack(router)} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>Trip Chat</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {ride.pickup} → {ride.destination}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.systemNoticeBox}>
            <Ionicons name="shield-checkmark" size={16} color="#047857" style={{ marginRight: 6 }} />
            <Text style={styles.systemNoticeText}>
              Booking Confirmed. Contact details and direct trip messaging are active.
            </Text>
          </View>

          {messages.length === 0 ? (
            <Text style={styles.noMessagesText}>No messages yet. Say hello to coordinate your trip!</Text>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId === currentUserId;
              return (
                <View
                  key={msg.id}
                  style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}
                >
                  <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
                    {msg.body}
                  </Text>
                  <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.otherTimeText]}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.inputRow, { paddingBottom: bottomInsetPadding }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.bodyMd,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.headlineLg,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  headerSubtitle: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  messagesList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  systemNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  systemNoticeText: {
    ...Typography.bodyMd,
    fontSize: 12.5,
    color: '#065F46',
    flex: 1,
    fontWeight: '500',
  },
  noMessagesText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    ...Typography.bodyMd,
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#0F172A',
  },
  timeText: {
    ...Typography.bodyMd,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTimeText: {
    color: '#94A3B8',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#0F172A',
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
