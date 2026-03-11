import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface CompanyLogoProps {
  variant?: 'white' | 'black';
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export default function CompanyLogo({ variant = 'white', width = 120, height = 40, style }: CompanyLogoProps) {
  const source = variant === 'white' 
    ? require('@/assets/images/company_logo-white.png')
    : require('@/assets/images/company-logo-black.png');

  return (
    <Image 
      source={source}
      style={[{ width, height, resizeMode: 'contain' }, style]}
    />
  );
}
