import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Dimensions,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedView } from '@/components/ThemedView';
import { ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { TripList } from '@/components/trips/TripList';
import { Trip } from '@/src/types/trip';
import { Theme } from '@/src/theme/types';
import { useTripStore } from '@/src/store/useTripStore';
import { TripStatus } from '@/src/types/trip';
import CreateTripModal from '@/components/trips/CreateTripModal';
import { useAuthStore } from '@/src/store/useAuthStore';
import { RefreshControl } from 'react-native';
import Avatar from '@/components/ui/Avatar';


export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState<'Active' | 'Recent' | 'Cancelled'>('Active');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const { token, isInitialized } = useAuthStore();

  const searchWidth = useRef(new Animated.Value(40)).current;

  // State for Create Trip Modal
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  // Import trips and fetchTrips from the store
  const { trips, fetchTrips, createTrip, loading: tripsLoading } = useTripStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch trips when component mounts
  useEffect(() => {
    if (isInitialized && token) {
      fetchTrips();
    } else {
      console.log('Auth not initialized or token not available yet.');
    }
  }, [fetchTrips, token, isInitialized]);
  

  const toggleSearch = () => {
    Animated.timing(searchWidth, {
      toValue: searchExpanded ? 40 : screenWidth * 0.7,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSearchExpanded(!searchExpanded);
      if (!searchExpanded) {
        setSearchQuery('');
      }
    });
  };

  // Filter trips based on active tab and search query
  const filteredTrips = React.useMemo(() => {
    let filtered = [...trips];
    filtered = filtered.map(trip => {
      let normalizedStatus = trip.status?.toUpperCase();
      if (normalizedStatus === 'PLANNED') {
        normalizedStatus = 'PLANNING';
      }
      return {
        ...trip,
        status: normalizedStatus as TripStatus
      };
    });
  
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((trip) =>
        trip.name.toLowerCase().includes(query) ||
        (trip.destination && trip.destination.toLowerCase().includes(query))
      );
    }
  
    // Normalize status for comparison
    filtered = filtered.map(trip => ({
      ...trip,
      status: trip.status?.toUpperCase() as TripStatus
    }));
  
    // Filter by tab
    switch (activeTab) {
      case 'Active':
        return filtered.filter((trip) => 
          trip.status === 'ACTIVE' || trip.status === 'PLANNING');
      case 'Recent':
        return filtered.filter(
          (trip) =>
            trip.status === 'COMPLETED' || new Date(trip.endDate) < new Date()
        );
      case 'Cancelled':
        return filtered.filter((trip) => trip.status === 'CANCELLED');
      default:
        return filtered;
    }
  }, [trips, activeTab, searchQuery]);

  useEffect(() => {
    console.log('All trips:', trips);
    console.log('Filtered trips:', filteredTrips);
  }, [trips, filteredTrips]);

  const handleTripPress = (trip: Trip) => {
    // Navigate to trip details
    console.log('Navigate to trip:', trip.id);
    // You can use your navigation logic here
    // e.g., navigation.navigate('TripDetails', { tripId: trip.id });
  };

  const handleRefresh = useCallback(async () => {
    console.log('Pull-to-refresh triggered'); // Add this log
    setIsRefreshing(true);
    try {
      await fetchTrips();
      console.log('Refresh completed successfully'); // Add this log
    } catch (error) {
      console.error('Failed to refresh trips:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTrips]);

  const handleCreateTrip = () => {
    setCreateModalVisible(true);
  };

  const handleModalClose = () => {
    setCreateModalVisible(false);
  };

  const handleTripSubmit = async (tripData: Trip) => {
    try {
      await createTrip({
        name: tripData.name,
        description: tripData.description,
        destination: tripData.destination,
        startDate: new Date(tripData.startDate),
        endDate: new Date(tripData.endDate),
      });
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Failed to create trip:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    
    <SafeAreaView style={styles(theme, screenWidth).container}>
      <ThemedView style={styles(theme, screenWidth).header}>
        {/* Header Title */}
        <Avatar 
            user={useAuthStore.getState().user}
            size="md"
            style={styles(theme).avatar}
          />

        {/* Animated Search Bar */}
        <Animated.View style={[styles(theme).searchBar, { width: searchWidth }]}>
          <TouchableOpacity onPress={toggleSearch} style={styles(theme).searchIcon}>
            <Ionicons
              name={searchExpanded ? 'close-outline' : 'search-outline'}
              size={20}
              color={theme.colors.content.primary}
            />
          </TouchableOpacity>
          {searchExpanded && (
            <TextInput
              style={styles(theme).searchInput}
              placeholder="Search trips"
              placeholderTextColor={theme.colors.content.secondary}
              onBlur={toggleSearch}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          )}
        </Animated.View>
      </ThemedView>

      {/* Tabs Section */}
      <ThemedView style={styles(theme).tabs}>
        {['Active', 'Recent', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as 'Active' | 'Recent' | 'Cancelled')}
            style={[
              styles(theme).tabButton,
              activeTab === tab && styles(theme).activeTabButton,
            ]}
          >
            <Text
              style={[
                styles(theme).tabText,
                activeTab === tab && styles(theme).activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Trip List */}
      <ScrollView
        style={[
          styles(theme).listContainer,
          { flex: 1 }  // Ensure it takes up available space
        ]}
        contentContainerStyle={[
          styles(theme).listContentContainer,
          // Only add flexGrow if list is empty
          trips.length === 0 ? { flexGrow: 1 } : undefined
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary.main]}
            tintColor={theme.colors.primary.main}
            progressBackgroundColor={theme.colors.surface.default}
            // Add these props to help with gesture detection
            enabled={true}
            progressViewOffset={0}
          />
        }
        scrollEventThrottle={16}
        alwaysBounceVertical={true} // iOS specific
        bounces={true} // iOS specific
      >
        {tripsLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        ) : filteredTrips && filteredTrips.length > 0 ? (
          <TripList
            trips={filteredTrips}
            onTripPress={handleTripPress}
          />
        ) : (
          <ThemedView style={styles(theme).emptyContainer}>
            <ThemedText style={styles(theme).emptyText}>
              No trips found for this filter
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles(theme).fab} onPress={handleCreateTrip}>
        <Ionicons
          name="add-outline"
          size={24}
          color={theme.colors.primary.onPrimary}
        />
      </TouchableOpacity>

      {/* Create Trip Modal */}
      <CreateTripModal
        visible={isCreateModalVisible}
        onClose={handleModalClose}
        onSubmit={handleTripSubmit}
      />
    </SafeAreaView>
  );
}

const styles = (theme: Theme, screenWidth?: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.variant,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.layout.screen.padding,
      marginBottom: theme.spacing.layout.section.gap,
      backgroundColor: theme.colors.surface.variant,
      paddingTop: theme.spacing.layout.section.padding,
    },
    title: {
      ...theme.typography.heading.h1,
      color: '#FFFFFF',
      marginBottom: theme.spacing.inset.sm,
      marginTop: theme.spacing.stack.md,
      flexShrink: 0,
      flexGrow: 0,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      borderRadius: theme.spacing.inset.sm * 2,
      height: 36,
      overflow: 'hidden',
      backgroundColor: '#2C2C2C',
      marginBottom: theme.spacing.inset.sm,
    },
    searchIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.inset.sm,
    },
    searchInput: {
      flex: 1,
      paddingHorizontal: theme.spacing.inset.sm,
      paddingVertical: 4,
      height: 36,
      ...theme.typography.body.medium,
      color: theme.colors.content.primary,
    },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      marginBottom: theme.spacing.layout.section.padding,
      backgroundColor: theme.colors.surface.variant,
    },
    tabButton: { paddingVertical: theme.spacing.inline.sm },
    activeTabButton: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary.main,
    },
    tabText: {
      ...theme.typography.button.medium,
      color: theme.colors.content.secondary,
    },
    activeTabText: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.button.medium.fontWeight,
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing.layout.section.padding + 80,
      right: theme.spacing.layout.section.padding,
      backgroundColor: theme.colors.primary.main,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 1,
      elevation: 5,
    },
    listContainer: {
      flex: 1,
      paddingTop: 0,
    },
    listContentContainer: {
      flexGrow: 1,
    },
  });