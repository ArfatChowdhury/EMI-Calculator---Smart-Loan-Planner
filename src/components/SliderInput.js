import { Colors } from '@/constants/Colors';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const SliderInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    prefix = '',
    compact = false
}) => {
    const handleSliderChange = (val) => {
        onChange(val);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            <View style={[styles.header, compact && styles.compactHeader]}>
                {!compact && <Text style={styles.label}>{label}</Text>}
                <View style={[styles.inputContainer, compact && styles.compactInputContainer]}>
                    {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
                    <TextInput
                        style={[styles.input, compact && styles.compactInput]}
                        value={value.toString()}
                        onChangeText={(text) => onChange(Number(text) || 0)}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textSecondary}
                    />
                    {unit ? <Text style={styles.unit}>{unit}</Text> : null}
                </View>
            </View>

            <Slider
                style={[styles.slider, compact && styles.compactSlider]}
                minimumValue={min}
                maximumValue={max}
                step={step}
                value={value}
                onValueChange={handleSliderChange}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
            />

            {!compact && (
                <View style={styles.rangeLabels}>
                    <Text style={styles.rangeText}>{prefix}{min}{unit}</Text>
                    <Text style={styles.rangeText}>{prefix}{max}{unit}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        width: '100%',
    },
    compactContainer: {
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    compactHeader: {
        marginBottom: 4,
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    compactInputContainer: {
        paddingHorizontal: 6,
    },
    input: {
        color: Colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 8,
        minWidth: 80,
        textAlign: 'right',
    },
    compactInput: {
        fontSize: 14,
        paddingVertical: 4,
        minWidth: 60,
    },
    prefix: {
        color: Colors.textSecondary,
        marginRight: 4,
        fontSize: 16,
    },
    unit: {
        color: Colors.textSecondary,
        marginLeft: 4,
        fontSize: 16,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    compactSlider: {
        height: 30,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -4,
    },
    rangeText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
});

export default SliderInput;
