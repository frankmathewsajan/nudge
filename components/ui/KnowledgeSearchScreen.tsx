// Knowledge Search Screen - Material You design
// Clean, minimal, knowledge-centric interface

import styles from '@/assets/styles/knowledge-search.styles';
import {
    CameraIcon,
    ExploreIcon,
    HomeIcon,
    MicrophoneIcon,
    ProfileIcon,
    ShareIcon,
    UserIcon
} from '@/components/ui/MaterialIcons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KnowledgeSearchProps {
  onSearch?: (query: string) => void;
  onVoiceSearch?: () => void;
  onCameraSearch?: () => void;
}

export const KnowledgeSearchScreen: React.FC<KnowledgeSearchProps> = ({
  onSearch,
  onVoiceSearch,
  onCameraSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={styles.container.backgroundColor}
        translucent={false}
      />
      
      {/* Subtle geometric background pattern */}
      <View style={styles.backgroundPattern}>
        <View style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#E8F0FE',
          opacity: 0.3,
        }} />
        <View style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: '#FEF7E0',
          opacity: 0.4,
          transform: [{ rotate: '45deg' }],
        }} />
        <View style={{
          position: 'absolute',
          bottom: '30%',
          left: '20%',
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#E8F5E8',
          opacity: 0.5,
        }} />
      </View>
      
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.profileContainer}>
          <ProfileIcon size={32} color="#5F6368" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareContainer}>
          <ShareIcon size={24} color="#5F6368" />
        </TouchableOpacity>
      </View>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {/* Abstract Logo/Graphic */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInner} />
          </View>
          <View style={styles.logoAccent} />
        </View>
        
        {/* Main Heading */}
        <Text style={styles.mainHeading}>Where knowledge begins</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.searchBar}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onCameraSearch}
            activeOpacity={0.7}
          >
            <CameraIcon size={24} color="#5F6368" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search or ask anything…"
            placeholderTextColor="#9AA0A6"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onVoiceSearch}
            activeOpacity={0.7}
          >
            <MicrophoneIcon size={24} color="#5F6368" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <HomeIcon size={24} color="#1A73E8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <ExploreIcon size={24} color="#5F6368" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <UserIcon size={24} color="#5F6368" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};