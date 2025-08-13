import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { weldingColors } from '../theme/colors';

interface SignatureCaptureProps {
  value?: string;
  onChange: (signature: string) => void;
  onClear: () => void;
  label?: string;
  width?: number;
  height?: number;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  value,
  onChange,
  onClear,
  label = 'Signature',
  width = 300,
  height = 150
}) => {
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        setIsDrawing(true);
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        if (isDrawing) {
          const { locationX, locationY } = event.nativeEvent;
          setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
        }
      },
      onPanResponderRelease: () => {
        setIsDrawing(false);
        if (currentPath.length > 0) {
          setPaths(prev => [...prev, currentPath]);
          setCurrentPath([]);
          
          // Convert paths to SVG string for storage
          const svgString = generateSVG([...paths, currentPath], width, height);
          onChange(svgString);
        }
      },
    })
  ).current;

  const generateSVG = (allPaths: Array<Array<{ x: number; y: number }>>, w: number, h: number): string => {
    if (allPaths.length === 0) return '';
    
    const pathData = allPaths
      .map(path => {
        if (path.length === 0) return '';
        const firstPoint = path[0];
        let d = `M ${firstPoint.x} ${firstPoint.y}`;
        for (let i = 1; i < path.length; i++) {
          d += ` L ${path[i].x} ${path[i].y}`;
        }
        return d;
      })
      .filter(p => p !== '')
      .join(' ');

    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="${pathData}" stroke="black" stroke-width="2" fill="none"/>
    </svg>`;
  };

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
    onClear();
  };

  const renderCanvas = () => {
    if (Platform.OS === 'web') {
      return (
        <canvas
          width={width}
          height={height}
          style={{
            border: `2px solid ${weldingColors.neutralLight}`,
            borderRadius: 8,
            backgroundColor: 'white',
            cursor: 'crosshair'
          }}
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setIsDrawing(true);
            setCurrentPath([{ x, y }]);
          }}
          onMouseMove={(e) => {
            if (isDrawing) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setCurrentPath(prev => [...prev, { x, y }]);
            }
          }}
          onMouseUp={() => {
            setIsDrawing(false);
            if (currentPath.length > 0) {
              setPaths(prev => [...prev, currentPath]);
              setCurrentPath([]);
              
              const svgString = generateSVG([...paths, currentPath], width, height);
              onChange(svgString);
            }
          }}
          onMouseLeave={() => {
            setIsDrawing(false);
            if (currentPath.length > 0) {
              setPaths(prev => [...prev, currentPath]);
              setCurrentPath([]);
              
              const svgString = generateSVG([...paths, currentPath], width, height);
              onChange(svgString);
            }
          }}
        />
      );
    }

    return (
      <View
        style={[styles.canvas, { width, height }]}
        {...panResponder.panHandlers}
      >
        {paths.map((path, pathIndex) => (
          <View key={pathIndex} style={styles.pathContainer}>
            {path.map((point, pointIndex) => (
              <View
                key={pointIndex}
                style={[
                  styles.point,
                  {
                    left: point.x - 1,
                    top: point.y - 1,
                  },
                ]}
              />
            ))}
          </View>
        ))}
        {currentPath.map((point, pointIndex) => (
          <View
            key={`current-${pointIndex}`}
            style={[
              styles.point,
              {
                left: point.x - 1,
                top: point.y - 1,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {renderCanvas()}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={clearSignature}
          style={styles.button}
          textColor={weldingColors.error}
        >
          Clear
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: weldingColors.textPrimary,
  },
  canvas: {
    borderWidth: 2,
    borderColor: weldingColors.neutralLight,
    borderRadius: 8,
    backgroundColor: 'white',
    position: 'relative',
  },
  pathContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  point: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: 'black',
    borderRadius: 1,
  },
  buttonContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  button: {
    borderColor: weldingColors.error,
  },
});


