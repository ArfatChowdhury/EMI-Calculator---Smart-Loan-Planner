import { Colors } from '@/constants/Colors';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const DonutChart = ({ principal, interest }) => {
    const total = principal + interest;
    const principalPercent = ((principal / total) * 100).toFixed(1);
    const interestPercent = ((interest / total) * 100).toFixed(1);

    const data = [
        {
            name: 'Principal',
            population: principal,
            color: Colors.primary,
            legendFontColor: Colors.textPrimary,
            legendFontSize: 12,
        },
        {
            name: 'Interest',
            population: interest,
            color: Colors.danger,
            legendFontColor: Colors.textPrimary,
            legendFontSize: 12,
        },
    ];

    const chartConfig = {
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    };

    return (
        <View style={styles.container}>
            <PieChart
                data={data}
                width={screenWidth - 40}
                height={200}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                absolute
                hasLegend={true}
            />
            <View style={styles.legendOverlay}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                    <Text style={styles.legendText}>Principal: {principalPercent}%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
                    <Text style={styles.legendText}>Interest: {interestPercent}%</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 10,
    },
    legendOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
});

export default DonutChart;
