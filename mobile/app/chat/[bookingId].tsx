import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SEED_BOOKINGS, SEED_MESSAGES, SEED_RIDES, DemoMessage } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';
import { safeBack } from '../../src/utils/navigation';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookingId } = useLocalSearchParams();
  const booking = SEED_BOOKINGS.find(b => b.id === bookingId) || SEED_BOOKINGS[0];
  const ride = SEED_RIDES.find(r => r.id === booking.rideId) || SEED_RIDES[0];

  const [messages, setMessages] = useState<DemoMessage[]>(
    SEED_MESSAGES.filter(m => m.bookingId === booking.id)
  );
  const [inputText, setInputText] = useState('');

  const currentUserId = 'user_sarah_456'; // Current demo rider

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: DemoMessage = {
      id: `msg_${Date.now()}`,
      bookingId: booking.id,
      senderId: currentUserId,
      body: inputText.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const isClosed = booking.status !== 'approved';

  const topInsetHeight = Math.max(insets.top + 12, 42);
  const bottomInsetPadding = Math.max(insets.bottom, 12);

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
            <Text style={styles.headerName}>{booking.driverName}</Text>
            <View style={styles.badgeRow}>
              <Ionicons
                name={ride.vehicleType === 'carpool' ? 'car-outline' : 'bicycle-outline'}
                size={14}
                color={Colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.headerSub}>{ride.vehicleType === 'carpool' ? 'Carpool' : 'Bike Pool'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rideContextStrip}>
          <View style={styles.stripRow}>
            <Ionicons name="location-outline" size={15} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.stripText}>Meeting Point: <Text style={styles.bold}>{ride.meetingPoint}</Text></Text>
          </View>
          <View style={styles.noticeRow}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.onSurfaceVariant} style={{ marginRight: 6 }} />
            <Text style={styles.noticeText}>This chat is available until the ride is completed. Keep messages about this ride.</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <View
                key={msg.id}
                style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}
              >
                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                  {msg.body}
                </Text>
                <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.otherTimeText]}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {isClosed ? (
          <View style={[styles.closedBanner, { paddingBottom: bottomInsetPadding }]}>
            <Text style={styles.closedText}>
              {booking.status === 'completed' ? 'This ride is complete. This chat is now closed.' : 'This booking was cancelled. This chat is now closed.'}
            </Text>
          </View>
        ) : (
          <View style={[styles.inputContainer, { paddingBottom: bottomInsetPadding }]}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={Colors.outline}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.85}>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    paddingRight: Spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerName: {
    ...Typography.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSub: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  rideContextStrip: {
    backgroundColor: '#EFF6FF',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    gap: 4,
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripText: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    fontSize: 13,
  },
  bold: {
    fontWeight: '700',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    flex: 1,
  },
  messagesContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: 18,
    marginBottom: Spacing.xs,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.bodyMd,
    fontSize: 15,
  },
  myMessageText: {
    color: Colors.onPrimary,
  },
  otherMessageText: {
    color: Colors.onSurface,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: '#DBEAFE',
  },
  otherTimeText: {
    color: Colors.outline,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: Spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.onSurface,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closedBanner: {
    padding: Spacing.md,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  closedText: {
    ...Typography.labelLg,
    color: Colors.error,
    textAlign: 'center',
  },
});
