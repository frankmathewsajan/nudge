import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const C = {
  primary: '#2196F3', primaryContainer: '#E3F2FD', onPrimary: '#FFFFFF', onPrimaryContainer: '#0D47A1',
  secondary: '#009688', secondaryContainer: '#E0F2F1', onSecondary: '#FFFFFF', onSecondaryContainer: '#004D40',
  tertiary: '#FF9800', background: '#FAFAFA', surface: '#FFFFFF', surfaceVariant: '#F5F5F5',
  onSurface: '#212121', onSurfaceVariant: '#616161', outline: '#E0E0E0', success: '#4CAF50',
  successContainer: '#E8F5E8', shadow: '#000000',
};

const T = StyleSheet.create({
  display: { fontSize: 36, fontWeight: '700', lineHeight: 44, color: C.onSurface },
  headline: { fontSize: 28, fontWeight: '600', lineHeight: 36, color: C.onSurface },
  title: { fontSize: 22, fontWeight: '600', lineHeight: 28, color: C.onSurface },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24, color: C.onSurface },
  bodyMedium: { fontSize: 14, fontWeight: '400', lineHeight: 20, color: C.onSurface },
  label: { fontSize: 16, fontWeight: '600', lineHeight: 20, color: C.onSurface },
});

interface ButtonProps {
  children: React.ReactNode; onPress: () => void; variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'small' | 'medium' | 'large'; disabled?: boolean; loading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = React.memo(({
  children, onPress, variant = 'primary', size = 'medium', disabled = false, loading = false
}) => {
  const sizes = { small: [24, 12, 48], medium: [32, 16, 56], large: [40, 20, 64] };
  const [pH, pV, h] = sizes[size];
  
  const styles = {
    primary: { backgroundColor: disabled ? C.outline : C.primary, borderRadius: 24 },
    secondary: { backgroundColor: disabled ? C.outline : C.secondaryContainer, borderRadius: 20 },
    outlined: { backgroundColor: 'transparent', borderWidth: 2, borderColor: disabled ? C.outline : C.primary, borderRadius: 24 },
  };
  
  const textColors = {
    primary: disabled ? C.onSurfaceVariant : C.onPrimary,
    secondary: disabled ? C.onSurfaceVariant : C.onSecondaryContainer,
    outlined: disabled ? C.onSurfaceVariant : C.primary,
  };

  return (
    <TouchableOpacity
      style={[styles[variant], { paddingHorizontal: pH, paddingVertical: pV, minHeight: h, alignItems: 'center', justifyContent: 'center' }]}
      onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}
    >
      {loading ? <ActivityIndicator color={textColors[variant]} /> : 
        <Text style={[T.label, { color: textColors[variant] }]}>{children}</Text>}
    </TouchableOpacity>
  );
});

export const DisplayText: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => 
  <Text style={T.display}>{children}</Text>);

export const HeadlineText: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => 
  <Text style={T.headline}>{children}</Text>);

export const TitleText: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => 
  <Text style={T.title}>{children}</Text>);

export const BodyText: React.FC<{ children: React.ReactNode; variant?: 'large' | 'medium' }> = React.memo(({ children, variant = 'large' }) => 
  <Text style={variant === 'large' ? T.bodyLarge : T.bodyMedium}>{children}</Text>);

interface InputProps {
  value: string; onChangeText: (text: string) => void; placeholder?: string;
  multiline?: boolean; numberOfLines?: number; disabled?: boolean;
}

export const CustomInput: React.FC<InputProps> = React.memo(({ value, onChangeText, placeholder, multiline = false, numberOfLines = 1, disabled = false }) => (
  <TextInput
    style={{
      backgroundColor: C.surfaceVariant, borderColor: C.outline, borderWidth: 1, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: C.onSurface,
      minHeight: multiline ? 120 : 56, textAlignVertical: multiline ? 'top' : 'center',
    }}
    value={value} onChangeText={onChangeText} placeholder={placeholder}
    placeholderTextColor={C.onSurfaceVariant} multiline={multiline}
    numberOfLines={numberOfLines} editable={!disabled}
  />
));

export const Container: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => 
  <View style={{ flex: 1, backgroundColor: C.background, paddingHorizontal: 20 }}>{children}</View>);

export const Surface: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => (
  <View style={{
    backgroundColor: C.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.outline,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, marginVertical: 8,
  }}>{children}</View>
));

export const SuccessCard: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => (
  <View style={{
    backgroundColor: C.successContainer, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.success,
    shadowColor: C.success, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, marginVertical: 8,
  }}>{children}</View>
));

export const Divider: React.FC = React.memo(() => 
  <View style={{ height: 1, backgroundColor: C.outline, marginVertical: 16, width: '100%' }} />);
