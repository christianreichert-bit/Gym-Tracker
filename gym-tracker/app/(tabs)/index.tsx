// app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import exercisesData from '@/assets/data/exercises.json';

const { width } = Dimensions.get('window');

// Get today's date formatted
const getTodaysDate = () => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

// Sample exercise data (will be replaced with Supabase data)
const initialExercises = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    setCount: '3',
    sets: [
      { setNumber: 1, reps: '10', weight: '135' },
      { setNumber: 2, reps: '8', weight: '155' },
      { setNumber: 3, reps: '6', weight: '175' },
    ],
  },
  {
    id: '2',
    name: 'Barbell Squat',
    muscleGroup: 'Legs',
    setCount: '3',
    sets: [
      { setNumber: 1, reps: '10', weight: '185' },
      { setNumber: 2, reps: '8', weight: '205' },
      { setNumber: 3, reps: '6', weight: '225' },
    ],
  },
  {
    id: '3',
    name: 'Pull-Ups',
    muscleGroup: 'Back',
    setCount: '3',
    sets: [
      { setNumber: 1, reps: '8', weight: 'BW' },
      { setNumber: 2, reps: '7', weight: 'BW' },
      { setNumber: 3, reps: '6', weight: 'BW' },
    ],
  },
];

// Search Modal Component
const ExerciseSearchModal = ({ visible, onClose, onSelectExercise }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredExercises = exercisesData.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectExercise = (exercise) => {
    // Create a new exercise with default 3 sets
    const newExercise = {
      id: Date.now().toString(),
      name: exercise.name,
      muscleGroup: exercise.primaryMuscles[0] || 'Other',
      setCount: '3',
      sets: [
        { setNumber: 1, reps: '10', weight: '' },
        { setNumber: 2, reps: '10', weight: '' },
        { setNumber: 3, reps: '10', weight: '' },
      ],
    };
    onSelectExercise(newExercise);
    onClose();
    setSearchQuery('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Add Exercise</ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <IconSymbol name="xmark" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            style={styles.exerciseList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseListItem}
                onPress={() => handleSelectExercise(item)}
                activeOpacity={0.7}>
                <View style={styles.exerciseListItemContent}>
                  <ThemedText style={styles.exerciseListItemName}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.exerciseListItemMuscle}>
                    {item.primaryMuscles?.join(', ') || 'No muscle group'}
                  </ThemedText>
                </View>
                <IconSymbol name="plus" size={20} color="#FF6B00" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <ThemedText style={styles.emptySearchText}>
                  No exercises found
                </ThemedText>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Set Row Component - Table style with editable inputs
const SetRow = ({ set, onUpdateSet }) => {
  const [reps, setReps] = useState(set.reps);
  const [weight, setWeight] = useState(set.weight);

  const handleRepsChange = (text) => {
    setReps(text);
    onUpdateSet(set.setNumber, 'reps', text);
  };

  const handleWeightChange = (text) => {
    setWeight(text);
    onUpdateSet(set.setNumber, 'weight', text);
  };

  return (
    <View style={styles.setRow}>
      <View style={styles.setNumberCell}>
        <ThemedText style={styles.setNumberText}>{set.setNumber}</ThemedText>
      </View>
      <View style={styles.setInputCell}>
        <TextInput
          style={styles.setInput}
          value={reps}
          onChangeText={handleRepsChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#444"
          selectionColor="#FF6B00"
        />
      </View>
      <View style={styles.setInputCell}>
        <TextInput
          style={styles.setInput}
          value={weight}
          onChangeText={handleWeightChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#444"
          selectionColor="#FF6B00"
        />
      </View>
    </View>
  );
};

// Exercise Card Component
const ExerciseCard = ({ exercise, onRemove, onUpdateSet, onUpdateSetCount }) => {
  const [expanded, setExpanded] = useState(false);
  const [setCountInput, setSetCountInput] = useState(exercise.setCount);

  const handleSetCountChange = (text) => {
    setSetCountInput(text);
  };

  const handleSetCountSubmit = () => {
    let newCount = parseInt(setCountInput) || 0;
    // Ensure at least 1 set, max 10 sets
    newCount = Math.min(Math.max(newCount, 1), 10);
    setSetCountInput(newCount.toString());
    onUpdateSetCount(exercise.id, newCount);
  };

  const handleUpdateSet = (setNumber, field, value) => {
    onUpdateSet(exercise.id, setNumber, field, value);
  };

  return (
    <View style={styles.exerciseCard}>
      {/* Exercise Header */}
      <TouchableOpacity
        style={styles.exerciseHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}>
        <View style={styles.exerciseHeaderLeft}>
          <IconSymbol
            name={expanded ? 'chevron.down' : 'chevron.right'}
            size={18}
            color="#FF6B00"
          />
          <View style={styles.exerciseInfo}>
            <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
            <View style={styles.exerciseMetaRow}>
              <View style={styles.setCountContainer}>
                <TextInput
                  style={styles.setCountInput}
                  value={setCountInput}
                  onChangeText={handleSetCountChange}
                  onBlur={handleSetCountSubmit}
                  onSubmitEditing={handleSetCountSubmit}
                  keyboardType="numeric"
                  maxLength={2}
                  selectionColor="#FF6B00"
                />
                <ThemedText style={styles.exerciseMeta}>sets</ThemedText>
              </View>
              <ThemedText style={styles.exerciseMeta}>• {exercise.muscleGroup}</ThemedText>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            onRemove(exercise.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <IconSymbol name="minus" size={20} color="#FF6B00" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Expanded Sets Table */}
      {expanded && (
        <View style={styles.setsTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.setNumberCell}>
              <ThemedText style={styles.tableHeaderText}>Set</ThemedText>
            </View>
            <View style={styles.setInputCell}>
              <ThemedText style={styles.tableHeaderText}>Reps</ThemedText>
            </View>
            <View style={styles.setInputCell}>
              <ThemedText style={styles.tableHeaderText}>Lbs</ThemedText>
            </View>
          </View>

          {/* Table Rows */}
          {exercise.sets.map((set) => (
            <SetRow 
              key={set.setNumber} 
              set={set} 
              onUpdateSet={handleUpdateSet}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function HomeScreen() {
  const [exercises, setExercises] = useState(initialExercises);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRemoveExercise = (exerciseId) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const handleAddExercise = (newExercise) => {
    setExercises([...exercises, newExercise]);
  };

  const handleUpdateSet = (exerciseId, setNumber, field, value) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.setNumber === setNumber ? { ...set, [field]: value } : set
            ),
          };
        }
        return exercise;
      })
    );
  };

  const handleUpdateSetCount = (exerciseId, newCount) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          const currentSets = exercise.sets;
          let newSets = [];
          
          if (newCount > currentSets.length) {
            // Add more sets
            newSets = [...currentSets];
            for (let i = currentSets.length + 1; i <= newCount; i++) {
              newSets.push({
                setNumber: i,
                reps: '10',
                weight: '',
              });
            }
          } else if (newCount < currentSets.length) {
            // Remove sets
            newSets = currentSets.slice(0, newCount);
          } else {
            // Same count
            newSets = currentSets;
          }

          return {
            ...exercise,
            setCount: newCount.toString(),
            sets: newSets,
          };
        }
        return exercise;
      })
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        
        {/* Header with Date */}
        <LinearGradient
          colors={['#FF6B00', '#FF8C40']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.dateContainer}>
            <IconSymbol name="calendar" size={20} color="#FFFFFF" />
            <ThemedText style={styles.dateText}>{getTodaysDate()}</ThemedText>
          </View>
        </LinearGradient>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Today's Workout</ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}>
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onRemove={handleRemoveExercise}
              onUpdateSet={handleUpdateSet}
              onUpdateSetCount={handleUpdateSetCount}
            />
          ))}
        </View>
      </ScrollView>

      <ExerciseSearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectExercise={handleAddExercise}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
    opacity: 0.9,
  },
  exercisesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  exerciseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseInfo: {
    marginLeft: 12,
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingHorizontal: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  setCountInput: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
    padding: 2,
    width: 24,
    textAlign: 'center',
  },
  exerciseMeta: {
    fontSize: 12,
    color: '#888',
  },
  removeButton: {
    padding: 4,
  },
  setsTable: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
    backgroundColor: '#121212',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  setNumberCell: {
    width: 40,
    alignItems: 'flex-start',
  },
  setInputCell: {
    flex: 1,
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: 14,
    color: '#888',
  },
  setInput: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '80%',
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exerciseListItemContent: {
    flex: 1,
  },
  exerciseListItemName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseListItemMuscle: {
    fontSize: 12,
    color: '#888',
  },
  emptySearch: {
    padding: 40,
    alignItems: 'center',
  },
  emptySearchText: {
    color: '#888',
    fontSize: 16,
  },
});