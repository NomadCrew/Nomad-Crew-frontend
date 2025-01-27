import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Portal, Modal, Text, TextInput, Button, useTheme } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// Import your Trip type from wherever it's defined
import { Trip } from '@/src/types/trip';

// The props match your existing code’s usage
interface CreateTripModalProps {
  visible: boolean;
  onClose: () => void;
  // The onSubmit function accepts a Trip and returns a Promise<void>
  onSubmit: (tripData: Trip) => Promise<void>;
}

export default function CreateTripModal({
  visible,
  onClose,
  onSubmit,
}: CreateTripModalProps) {
  const theme = useTheme();

  // Local state for the trip data
  const [trip, setTrip] = useState<Trip>({
    id: '', // The backend will ultimately set this, if needed
    name: '',
    destination: '',
    description: '',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    // If your Trip type has additional fields (e.g., status),
    // initialize them as needed
  });

  // Which date picker is open? 'start' or 'end'
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  /**
   * Handle the selection of a date from the DateTimePicker
   */
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }

    if (!selectedDate || !showDatePicker) return;

    const dateKey = showDatePicker === 'start' ? 'startDate' : 'endDate';
    setTrip((prev) => ({
      ...prev,
      [dateKey]: selectedDate.toISOString(),
    }));
  };

  /**
   * Optional: Basic form validation before submitting
   */
  const validateForm = () => {
    if (!trip.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a trip name.');
      return false;
    }
    if (!trip.destination.trim()) {
      Alert.alert('Validation Error', 'Please enter a destination.');
      return false;
    }
    if (new Date(trip.endDate) < new Date(trip.startDate)) {
      Alert.alert('Validation Error', 'End date must be after start date.');
      return false;
    }
    return true;
  };

  /**
   * Submit the trip data to the parent via onSubmit
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(trip);
      onClose(); // Close the modal after successful submit
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dismiss the modal, optionally checking for unsaved changes if desired
   */
  const handleDismiss = () => {
    onClose();
  };

  return (
    <Portal>
      {/* 
        contentContainerStyle + marginTop:'auto' + borderRadius 
        creates a bottom-sheet–like effect
      */}
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ maxHeight: '90%' }}
        >
          {/* 
            Optional: Press outside the sheet to dismiss (like a transparent overlay).
            This can be done with an absolutely-positioned Pressable if you wish.
          */}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />

          <View style={styles.contentWrapper}>
            {/* Drag handle style bar — purely decorative */}
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header row with a title & close button */}
              <View style={styles.headerRow}>
                <Text variant="titleLarge" style={styles.headerTitle}>
                  New Trip
                </Text>
                <Pressable onPress={handleDismiss} style={styles.closeButton}>
                  <Text style={{ fontSize: 18 }}>✕</Text>
                </Pressable>
              </View>

              {/* Trip Name */}
              <TextInput
                mode="outlined"
                label="Trip Name*"
                value={trip.name}
                onChangeText={(text) => setTrip((prev) => ({ ...prev, name: text }))}
                style={styles.textInput}
              />

              {/* Destination */}
              <TextInput
                mode="outlined"
                label="Destination*"
                value={trip.destination}
                onChangeText={(text) => setTrip((prev) => ({ ...prev, destination: text }))}
                style={styles.textInput}
              />

              {/* Description */}
              <TextInput
                mode="outlined"
                label="Description"
                value={trip.description}
                onChangeText={(text) => setTrip((prev) => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                style={[styles.textInput, { height: 100 }]}
              />

              {/* Row of start & end date pickers */}
              <View style={styles.dateRow}>
                <View style={[styles.dateField, { marginRight: 8 }]}>
                  <Text variant="labelLarge" style={styles.dateLabel}>
                    Start Date*
                  </Text>
                  <Pressable
                    onPress={() => setShowDatePicker('start')}
                    style={styles.dateDisplay}
                  >
                    <Text style={{ color: theme.colors.onSurface }}>
                      {format(new Date(trip.startDate), 'MMM dd, yyyy')}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.dateField}>
                  <Text variant="labelLarge" style={styles.dateLabel}>
                    End Date*
                  </Text>
                  <Pressable
                    onPress={() => setShowDatePicker('end')}
                    style={styles.dateDisplay}
                  >
                    <Text style={{ color: theme.colors.onSurface }}>
                      {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Actual DateTimePicker */}
              {showDatePicker && (
                <DateTimePicker
                  value={
                    showDatePicker === 'start'
                      ? new Date(trip.startDate)
                      : new Date(trip.endDate)
                  }
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={
                    showDatePicker === 'end'
                      ? new Date(trip.startDate)
                      : undefined
                  }
                />
              )}

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              >
                Create Trip
              </Button>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    // Position the modal at bottom of screen for a bottom sheet look
    marginTop: 'auto',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  contentWrapper: {
    padding: 16,
    paddingBottom: 24,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  textInput: {
    marginTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: 4,
  },
  dateDisplay: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: 24,
  },
});
