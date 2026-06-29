import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, Alert, Animated } from 'react-native';
import { COLORS, SPACING, CATEGORY_LABELS, CATEGORY_SYMBOLS, THEME_TAGS } from '@/constants/theme';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import type { Category } from '@/constants/theme';
import type { CreateEventForm } from '@/types';

const CITIES = ['Delhi NCR', 'Bangalore', 'Mumbai', 'Pune', 'Goa'];
const CHARACTER_LIMIT = 300;

export default function CreateScreen() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [form, setForm] = useState<CreateEventForm>({
    category: 'farewell',
    title: '',
    description: '',
    theme_description: '',
    theme_tags: [],
    college: '',
    batch: '',
    venue: '',
    city: 'Delhi NCR',
    event_date: new Date(),
    max_guests: 40,
    ticket_price: 0,
    requires_approval: true,
    college_email_only: true,
    show_guest_list: false,
    cover_image_url: '',
    access_type: 'application',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    },
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('events').insert({
        ...form,
        ticket_price: Math.round(form.ticket_price * 100),
        status: 'published',
        host_id: currentUser,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      router.push(`/event/${data.id}`);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create event');
    },
  });

  const categoryColor = COLORS.category[form.category];

  const handleCategorySelect = (cat: Category) => {
    setForm({ ...form, category: cat });
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets[0]) {
      setForm({ ...form, cover_image_url: result.assets[0].uri });
    }
  };

  const toggleTag = (tag: string) => {
    const tags = form.theme_tags.includes(tag)
      ? form.theme_tags.filter(t => t !== tag)
      : [...form.theme_tags, tag];
    setForm({ ...form, theme_tags: tags });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getCharCounterColor = () => {
    if (form.theme_description.length < 250) return '#555';
    if (form.theme_description.length < 290) return '#C9A050';
    return '#CF7A7A';
  };

  const StepIndicator = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>create event</Text>
      <Text style={styles.stepCounter}>{currentStep} of 3</Text>
    </View>
  );

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.progressSegment,
            { backgroundColor: step <= currentStep ? categoryColor.primary : '#2A2A2E' }
          ]}
        />
      ))}
    </View>
  );

  const categoryData: { label: string; symbol: string; bg: string; primary: string }[] = [
    { label: 'Farewell', symbol: CATEGORY_SYMBOLS.farewell, bg: COLORS.category.farewell.bg, primary: COLORS.category.farewell.primary },
    { label: 'Freshers', symbol: CATEGORY_SYMBOLS.freshers, bg: COLORS.category.freshers.bg, primary: COLORS.category.freshers.primary },
    { label: 'House Party', symbol: CATEGORY_SYMBOLS.house_party, bg: COLORS.category.house_party.bg, primary: COLORS.category.house_party.primary },
  ];

  const getCategoryKey = (label: string): Category => {
    const l = label.toLowerCase();
    if (l.includes('farewell')) return 'farewell';
    if (l.includes('freshers')) return 'freshers';
    return 'house_party';
  };

  const renderStep1 = () => (
    <>
      <View style={styles.section}>
        <View style={styles.categoryRow}>
          {categoryData.map((cat) => {
            const catKey = getCategoryKey(cat.label);
            const isSelected = form.category === catKey;
            return (
              <TouchableOpacity
                key={cat.label}
                style={[
                  styles.categoryCard,
                  { backgroundColor: cat.bg, borderColor: isSelected ? cat.primary : '#2A2A2E', borderWidth: isSelected ? 1.5 : 0.5 }
                ]}
                onPress={() => handleCategorySelect(catKey)}
              >
                <Text style={[styles.categorySymbol, { color: isSelected ? cat.primary : '#333' }]}>
                  {cat.symbol}
                </Text>
                <Text style={[styles.categoryLabel, { color: isSelected ? cat.primary : '#555' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.coverUpload} onPress={handleImageUpload}>
          {form.cover_image_url ? (
            <Image source={{ uri: form.cover_image_url }} style={styles.coverPreview} />
          ) : (
            <>
              <Text style={styles.coverIcon}>📷</Text>
              <Text style={styles.coverText}>upload cover photo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>event name</Text>
        <TextInput
          style={[styles.input, focusedField === 'title' && { borderColor: categoryColor.primary }]}
          placeholder="e.g. Golden Memories Farewell Night"
          placeholderTextColor="#444"
          value={form.title}
          onChangeText={(title) => setForm({ ...form, title })}
          onFocus={() => setFocusedField('title')}
          onBlur={() => setFocusedField(null)}
        />
      </View>

      {form.category !== 'house_party' && (
        <View style={styles.section}>
          <Text style={styles.inputLabel}>college & batch</Text>
          <TextInput
            style={[styles.input, focusedField === 'college' && { borderColor: categoryColor.primary }]}
            placeholder="e.g. DTU · Batch of 2025"
            placeholderTextColor="#444"
            value={`${form.college} · ${form.batch}`.trim()}
            onChangeText={(text) => {
              const parts = text.split('·');
              setForm({ ...form, college: parts[0]?.trim() || '', batch: parts[1]?.trim() || '' });
            }}
            onFocus={() => setFocusedField('college')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeField}>
            <Text style={styles.inputLabel}>date</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={formatDate(form.event_date)}
              onFocus={() => {}}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#444"
            />
          </View>
          <View style={styles.dateTimeField}>
            <Text style={styles.inputLabel}>time</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={formatTime(form.event_date)}
              onFocus={() => {}}
              placeholder="HH:MM AM/PM"
              placeholderTextColor="#444"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>venue / location</Text>
        <TextInput
          style={[styles.input, { paddingLeft: 32 }, focusedField === 'venue' && { borderColor: categoryColor.primary }]}
          placeholder="Rohini, New Delhi"
          placeholderTextColor="#444"
          value={form.venue}
          onChangeText={(venue) => setForm({ ...form, venue })}
          onFocus={() => setFocusedField('venue')}
          onBlur={() => setFocusedField(null)}
        />
        <Text style={styles.inputIcon}>📍</Text>
      </View>

      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.cityPills}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityPill, form.city === city && { backgroundColor: categoryColor.bg, borderColor: categoryColor.primary }]}
                onPress={() => setForm({ ...form, city })}
              >
                <Text style={[styles.cityPillText, form.city === city && { color: categoryColor.primary }]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.inputLabel}>themes & vibe tags</Text>
        <View style={styles.tagsContainer}>
          {THEME_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagPill,
                form.theme_tags.includes(tag)
                  ? { backgroundColor: categoryColor.bg, borderColor: categoryColor.primary }
                  : { backgroundColor: '#1A1A1E', borderColor: '#2A2A2E' }
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagPillText, form.theme_tags.includes(tag) && { color: categoryColor.primary }]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>describe your party theme</Text>
        <Text style={styles.subtext}>
          help guests understand the vibe, dress code, activities, and what to expect
        </Text>
        <View style={styles.textareaContainer}>
          <TextInput
            style={[styles.textarea, focusedField === 'theme_description' && { borderColor: categoryColor.primary }]}
            placeholder="e.g. We're doing a 90s Bollywood night — mandatory dress code, photo booth with props, DJ reveal at midnight, dinner included. Expect nostalgia and chaos."
            placeholderTextColor="#444"
            value={form.theme_description}
            onChangeText={(theme_description) => setForm({ ...form, theme_description })}
            onFocus={() => setFocusedField('theme_description')}
            onBlur={() => setFocusedField(null)}
            multiline
            maxLength={CHARACTER_LIMIT}
          />
          <Text style={[styles.charCounter, { color: getCharCounterColor() }]}>
            {form.theme_description.length} / {CHARACTER_LIMIT}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.toggleRow, { backgroundColor: '#141416', borderColor: '#2A2A2E' }]}
          onPress={() => setForm({ ...form, requires_approval: !form.requires_approval })}
        >
          <View>
            <Text style={styles.toggleTitle}>approval required</Text>
            <Text style={styles.toggleSubtitle}>you approve each guest request</Text>
          </View>
          <CustomToggle value={form.requires_approval} onColor={categoryColor.primary} />
        </TouchableOpacity>

        {form.category !== 'house_party' && (
          <TouchableOpacity
            style={[styles.toggleRow, { backgroundColor: '#141416', borderColor: '#2A2A2E' }]}
            onPress={() => setForm({ ...form, college_email_only: !form.college_email_only })}
          >
            <View>
              <Text style={styles.toggleTitle}>college email only</Text>
              <Text style={styles.toggleSubtitle}>restrict to your college domain</Text>
            </View>
            <CustomToggle value={form.college_email_only} onColor={categoryColor.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.toggleRow, { backgroundColor: '#141416', borderColor: '#2A2A2E' }]}
          onPress={() => setForm({ ...form, show_guest_list: !form.show_guest_list })}
        >
          <View>
            <Text style={styles.toggleTitle}>show guest list</Text>
            <Text style={styles.toggleSubtitle}>attendees can see who else is coming</Text>
          </View>
          <CustomToggle value={form.show_guest_list} onColor={categoryColor.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>max guests</Text>
        <TextInput
          style={[styles.input, focusedField === 'max_guests' && { borderColor: categoryColor.primary }]}
          placeholder="40"
          placeholderTextColor="#444"
          value={String(form.max_guests)}
          onChangeText={(text) => setForm({ ...form, max_guests: parseInt(text) || 0 })}
          onFocus={() => setFocusedField('max_guests')}
          onBlur={() => setFocusedField(null)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>ticket price</Text>
        <View style={styles.priceRow}>
          <Text style={styles.pricePrefix}>₹</Text>
          <TextInput
            style={[styles.input, styles.priceInput, focusedField === 'ticket_price' && { borderColor: categoryColor.primary }]}
            placeholder="0"
            placeholderTextColor="#444"
            value={String(form.ticket_price)}
            onChangeText={(text) => setForm({ ...form, ticket_price: parseInt(text) || 0 })}
            onFocus={() => setFocusedField('ticket_price')}
            onBlur={() => setFocusedField(null)}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.freePill, { backgroundColor: categoryColor.badgeBg, borderColor: categoryColor.primary }]}
            onPress={() => setForm({ ...form, ticket_price: 0 })}
          >
            <Text style={[styles.freePillText, { color: categoryColor.primary }]}>make it free</Text>
          </TouchableOpacity>
        </View>
        {form.ticket_price > 0 && (
          <Text style={styles.commissionText}>
            you receive ₹{Math.round(form.ticket_price * 0.925)} per ticket after 7.5% commission
          </Text>
        )}
      </View>
    </>
  );

  const renderStep3 = () => {
    const mockEvent = {
      ...form,
      id: 'preview',
      host_name: 'You',
    };

    return (
      <>
        <View style={styles.previewSubtitle}>
          <Text style={styles.previewTitle}>your listing preview</Text>
          <Text style={styles.previewSubtitleText}>this is how guests will see your event</Text>
        </View>

        <View style={styles.previewCard} pointerEvents="none">
          <EventPreviewCard event={mockEvent} />
        </View>

        <View style={styles.ticketStub}>
          <View style={styles.ticketTop}>
            <View>
              <Text style={styles.ticketTitle} numberOfLines={1}>{form.title || 'Event Title'}</Text>
              <Text style={styles.ticketMeta}>1 ticket · ₹{form.ticket_price}</Text>
            </View>
            <View style={[styles.categoryBadgeSmall, { backgroundColor: categoryColor.badgeBg, borderColor: categoryColor.primary }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryColor.primary }]}>
                {CATEGORY_LABELS[form.category]}
              </Text>
            </View>
          </View>
          <View style={styles.ticketBottom}>
            <View>
              <Text style={styles.ticketLabel}>Date</Text>
              <Text style={styles.ticketValue}>{formatDate(form.event_date)}</Text>
            </View>
            <View>
              <Text style={styles.ticketLabel}>Time</Text>
              <Text style={styles.ticketValue}>{formatTime(form.event_date)}</Text>
            </View>
            <View>
              <Text style={styles.ticketLabel}>Entry</Text>
              <Text style={styles.ticketValue}>QR at door</Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !form.title || !form.venue;
    return false;
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <StepIndicator />
      <ProgressBar />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      {currentStep < 3 ? (
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: categoryColor.primary, opacity: isNextDisabled() ? 0.5 : 1 }]}
          onPress={handleNextStep}
          disabled={isNextDisabled()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 1 ? 'next — vibe & access →' : 'next — preview & publish →'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.publishButton, { backgroundColor: categoryColor.primary }]}
          onPress={() => createEvent.mutate()}
          disabled={createEvent.isPending}
        >
          <Text style={styles.publishButtonText}>
            {createEvent.isPending ? 'publishing...' : 'publish event'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.publishNote}>your listing goes live immediately</Text>
    </View>
  );
}

function CustomToggle({ value, onColor }: { value: boolean; onColor: string }) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 16],
  });

  return (
    <View style={[styles.toggleTrack, { backgroundColor: value ? onColor : '#2A2A2E' }]}>
      <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
    </View>
  );
}

function EventPreviewCard({ event }: { event: any }) {
  return (
    <View style={styles.previewEventCard}>
      <Text style={styles.previewEventTitle}>{event.title || 'Event Title'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  stepCounter: {
    fontSize: 11,
    color: '#555',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  categorySymbol: {
    fontSize: 20,
    fontWeight: '500',
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  coverUpload: {
    height: 100,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: COLORS.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPreview: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  coverIcon: {
    fontSize: 22,
    color: '#444',
    marginBottom: 4,
  },
  coverText: {
    fontSize: 11,
    color: '#555',
  },
  inputLabel: {
    fontSize: 10,
    color: '#555',
    textTransform: 'lowercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.bg.surface,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 12,
    color: COLORS.text.primary,
    fontSize: 12,
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 26,
    fontSize: 14,
    color: '#444',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeField: {
    flex: 1,
  },
  cityPills: {
    flexDirection: 'row',
    gap: 8,
  },
  cityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1A1A1E',
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
  },
  cityPillText: {
    fontSize: 11,
    color: '#888',
  },
  subtext: {
    fontSize: 10,
    color: '#555',
    marginBottom: 6,
  },
  textareaContainer: {
    position: 'relative',
  },
  textarea: {
    backgroundColor: COLORS.bg.surface,
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
  },
  charCounter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  tagPillText: {
    fontSize: 10,
    color: '#888',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    marginBottom: 6,
  },
  toggleTitle: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 10,
    color: '#555',
  },
  toggleTrack: {
    width: 32,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pricePrefix: {
    fontSize: 14,
    color: '#666',
  },
  priceInput: {
    flex: 1,
  },
  freePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  freePillText: {
    fontSize: 10,
    fontWeight: '500',
  },
  commissionText: {
    fontSize: 10,
    color: '#555',
    marginTop: 6,
  },
  previewSubtitle: {
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 12,
    color: '#555',
    textTransform: 'lowercase',
  },
  previewSubtitleText: {
    fontSize: 10,
    color: '#444',
  },
  previewCard: {
    marginBottom: 16,
  },
  previewEventCard: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 18,
    padding: 16,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewEventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  ticketStub: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#2A2A2E',
  },
  ticketTop: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketBottom: {
    padding: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  ticketMeta: {
    fontSize: 10,
    color: '#555',
  },
  ticketLabel: {
    fontSize: 10,
    color: '#555',
  },
  ticketValue: {
    fontSize: 11,
    color: '#888',
  },
  categoryBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  categoryBadgeText: {
    fontSize: 9,
    color: COLORS.text.primary,
  },
  nextButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0E0E10',
  },
  publishButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0E0E10',
  },
  publishNote: {
    fontSize: 10,
    color: '#444',
    textAlign: 'center',
    padding: 16,
  },
});