import { Colors } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const DonutChart = ({ principal, interest, currency, width }) => {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light')];
    const chartWidth = width || screenWidth;

    const total = principal + interest;
    const principalPercent = total > 0 ? ((principal / total) * 100).toFixed(1) : '0.0';
    const interestPercent = total > 0 ? ((interest / total) * 100).toFixed(1) : '0.0';

    const data = [
        {
            name: 'Principal',
            population: principal,
            color: theme.primary,
            legendFontColor: theme.textPrimary,
            legendFontSize: 12,
        },
        {
            name: 'Interest',
            population: interest,
            color: theme.expense,
            legendFontColor: theme.textPrimary,
            legendFontSize: 12,
        },
    ];

    const chartConfig = {
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    };

    return (
        <View style={styles.container}>
            <PieChart
                data={data}
                width={chartWidth}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft={Math.max(0, (chartWidth / 2) - 100)}
                center={[0, 0]}
                absolute
                hasLegend={false}
            />
            <View style={styles.legendOverlay}>
                <View style={[styles.legendItem, { backgroundColor: settings.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6', marginRight: 12 }]}>
                    <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                    <View>
                        <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Principal</Text>
                        <Text style={[styles.legendText, { color: theme.textPrimary }]}>
                            {formatCurrency(principal, currency)} ({principalPercent}%)
                        </Text>
                    </View>
                </View>
                <View style={[styles.legendItem, { backgroundColor: settings.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                    <View style={[styles.dot, { backgroundColor: theme.expense }]} />
                    <View>
                        <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Interest</Text>
                        <Text style={[styles.legendText, { color: theme.textPrimary }]}>
                            {formatCurrency(interest, currency)} ({interestPercent}%)
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        paddingTop: 0,
    },
    legendOverlay: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: -10,
        paddingBottom: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    legendLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '800',
    },
});

export default DonutChart;
