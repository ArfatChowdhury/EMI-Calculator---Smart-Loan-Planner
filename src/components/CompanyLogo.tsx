import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import SVGatorComponent from '@/src/utils/limners';
import { Colors } from '@/constants/Colors';

interface CompanyLogoProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'white' | 'black' | 'primary';
}

export default function CompanyLogo({ width = 120, height = 40, style, variant = 'white' }: CompanyLogoProps) {
  const SVGator = SVGatorComponent as any;
  
  let color = '#FFFFFF';
  if (variant === 'black') color = '#000000';
  else if (variant === 'primary') color = Colors.light.primary;

  return (
    <View style={[{ width, height }, style]}>
      <SVGator width={width} height={height} color={color} />
    </View>
  );
}
