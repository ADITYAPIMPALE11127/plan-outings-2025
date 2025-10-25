import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { AddFriendFormData } from '../types/Friend';
import FormInput from './FormInput';
import Button from './Button';
import TagSelector from './TagSelector';
import './styles.css';

interface AddFriendProps {
  onFriendAdded?: () => void;
}

const AddFriend: React.FC<AddFriendProps> = ({ onFriendAdded }) => {
  const [formData, setFormData] = useState<AddFriendFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    preferences: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AddFriendFormData>>({});

  const availablePreferences = [
    'Movies', 'Restaurants', 'Sports', 'Gaming', 'Travel', 'Music',
    'Art', 'Photography', 'Fitness', 'Reading', 'Cooking', 'Dancing',
    'Hiking', 'Swimming', 'Shopping', 'Museums', 'Concerts', 'Theater'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<AddFriendFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkIfFriendExists = async (email: string): Promise<boolean> => {
    if (!auth.currentUser) return false;
    
    try {
      const friendsQuery = query(
        collection(db, 'friends'),
        where('addedBy', '==', auth.currentUser.uid),
        where('email', '==', email.toLowerCase())
      );
      const snapshot = await getDocs(friendsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking if friend exists:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !auth.currentUser) return;

    setLoading(true);
    try {
      // Check if friend already exists
      const friendExists = await checkIfFriendExists(formData.email);
      if (friendExists) {
        toast.error('This friend is already in your list');
        setLoading(false);
        return;
      }

      // Add friend to database
      await addDoc(collection(db, 'friends'), {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber?.trim() || '',
        location: formData.location?.trim() || '',
        preferences: formData.preferences || [],
        addedAt: serverTimestamp(),
        addedBy: auth.currentUser.uid,
        status: 'active'
      });

      toast.success('Friend added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        location: '',
        preferences: []
      });
      setErrors({});
      
      onFriendAdded?.();
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to add friend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AddFriendFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePreferencesChange = (preferences: string[]) => {
    setFormData(prev => ({ ...prev, preferences }));
  };

  return (
    <div className="add-friend-container">
      <div className="add-friend-header">
        <h2 className="add-friend-title">Add New Friend</h2>
        <p className="add-friend-subtitle">Add a friend to start planning outings together</p>
      </div>

      <form onSubmit={handleSubmit} className="add-friend-form">
        <div className="add-friend-fields">
          <FormInput
            name="name"
            label="Full Name *"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="Enter friend's full name"
            required
          />

          <FormInput
            name="email"
            label="Email Address *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            placeholder="friend@example.com"
            required
          />

          <FormInput
            name="phoneNumber"
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber || ''}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            error={errors.phoneNumber}
            placeholder="+1 (555) 123-4567"
          />

          <FormInput
            name="location"
            label="Location"
            type="text"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, State"
          />

          <div className="add-friend-preferences">
            <label className="add-friend-preferences-label">
              Interests & Preferences
            </label>
            <TagSelector
              label=""
              tags={availablePreferences}
              selectedTags={formData.preferences || []}
              onChange={handlePreferencesChange}
            />
            <p className="add-friend-preferences-help">
              Select up to 8 interests to help suggest relevant activities
            </p>
          </div>
        </div>

        <div className="add-friend-actions">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Adding Friend...' : 'Add Friend'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddFriend;
