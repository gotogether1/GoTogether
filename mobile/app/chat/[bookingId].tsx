import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { SEED_BOOKINGS, SEED_MESSAGES, SEED_RIDES, DemoMessage } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function ChatScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerName}>{booking.driverName}</Text>
            <Text style={styles.headerSub}>{ride.vehicleType === 'carpool' ? '🚗 Carpool' : '🚲 Bike Pool'}</Text>
          </View>
        </View>

        <View style={styles.rideContextStrip}>
          <Text style={styles.stripText}>📍 Meeting Point: <Text style={styles.bold}>{ride.meetingPoint}</Text></Text>
          <Text style={styles.noticeText}>ℹ️ This chat is available until the ride is completed. Keep messages about this ride.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.messagesContainer}>
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
          <View style={styles.closedBanner}>
            <Text style={styles.closedText}>
              {booking.status === 'completed' ? 'This ride is complete. This chat is now closed.' : 'This booking was cancelled. This chat is now closed.'}
            </Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={Colors.outline}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendIcon}>➔</Text>
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
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  backBtn: {
    paddingRight: Spacing.md,
  },
  backText: {
    ...Typography.labelLg,
    color: Colors.primary,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerName: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  headerSub: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  rideContextStrip: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  stripText: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
  },
  bold: {
    fontWeight: '700',
  },
  noticeText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  messagesContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: 16,
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
    borderColor: Colors.surfaceContainer,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.bodyMd,
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
    color: Colors.primaryContainer,
  },
  otherTimeText: {
    color: Colors.outline,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
    gap: Spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.onSurface,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: Colors.onPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  closedBanner: {
    padding: Spacing.md,
    backgroundColor: Colors.errorContainer,
    alignItems: 'center',
  },
  closedText: {
    ...Typography.labelLg,
    color: Colors.error,
    textAlign: 'center',
  },
});
