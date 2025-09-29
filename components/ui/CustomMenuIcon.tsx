/**
 * Custom Menu Icon
 * 
 * Material Design 3 inspired 3-line menu icon
 * Top two lines same length (long), bottom line shorter
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

interface CustomMenuIconProps {
    size?: number;
    color?: string;
}

export const CustomMenuIcon: React.FC<CustomMenuIconProps> = ({
    size = 24,
    color = '#000'
}) => {
    const viewBoxSize = 24;
    const strokeWidth = 2;
    
    // Top two lines: same length (18 units), starting from left
    const longLineLength = 18;
    const longLineStart = 0;
    const longLineEnd = longLineStart + longLineLength;
    
    // Bottom line: shorter (12 units), starting from left
    const shortLineLength = 12;
    const shortLineStart = 0;
    const shortLineEnd = shortLineStart + shortLineLength;
    
    // Vertical positioning with equal spacing
    const firstLineY = 6;
    const secondLineY = 11; // Adjusted for equal spacing (gap of 5 units each)
    const thirdLineY = 16;
    
    return (
        <View style={{ width: size, height: size }}>
            <Svg
                width={size}
                height={size}
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                fill="none"
            >
                {/* First line - long */}
                <Line
                    x1={longLineStart}
                    y1={firstLineY}
                    x2={longLineEnd}
                    y2={firstLineY}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                
                {/* Second line - long */}
                <Line
                    x1={longLineStart}
                    y1={secondLineY}
                    x2={longLineEnd}
                    y2={secondLineY}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                
                {/* Third line - shorter */}
                <Line
                    x1={shortLineStart}
                    y1={thirdLineY}
                    x2={shortLineEnd}
                    y2={thirdLineY}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
};