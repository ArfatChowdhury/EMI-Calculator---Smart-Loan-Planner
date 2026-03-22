import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import SVGatorComponent from '@/src/utils/limners';

interface CompanyLogoProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export default function CompanyLogo({ width = 120, height = 40, style }: CompanyLogoProps) {
  const SVGator = SVGatorComponent as any;
  return (
    <View style={[{ width, height }, style]}>
      <SVGator width={width} height={height} />
    </View>
  );
}
