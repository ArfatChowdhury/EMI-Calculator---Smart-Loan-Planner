import { Colors } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
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
    const { settings } = useSettings();
    const theme = Colors[settings.theme || 'light'];

    const handleSliderChange = (val) => {
        onChange(val);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            <View style={[styles.header, compact && styles.compactHeader]}>
                {!compact && <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>}
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }, compact && styles.compactInputContainer]}>
                    {prefix ? <Text style={[styles.prefix, { color: theme.textSecondary }]}>{prefix}</Text> : null}
                    <TextInput
                        style={[styles.input, { color: theme.primary }, compact && styles.compactInput]}
                        value={value.toString()}
                        onChangeText={(text) => onChange(Number(text) || 0)}
                        keyboardType="numeric"
                        placeholderTextColor={theme.textSecondary}
                    />
                    {unit ? <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text> : null}
                </View>
            </View>

            <Slider
                style={[styles.slider, compact && styles.compactSlider]}
                minimumValue={min}
                maximumValue={max}
                step={step}
                value={value}
                onValueChange={handleSliderChange}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primary}
            />

            {!compact && (
                <View style={styles.rangeLabels}>
                    <Text style={[styles.rangeText, { color: theme.textSecondary }]}>{prefix}{min}{unit}</Text>
                    <Text style={[styles.rangeText, { color: theme.textSecondary }]}>{prefix}{max}{unit}</Text>
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
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    compactInputContainer: {
        paddingHorizontal: 6,
    },
    input: {
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
        marginRight: 4,
        fontSize: 16,
    },
    unit: {
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
    },
});

export default SliderInput;
