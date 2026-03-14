try {
    const p = require('react-native-purchases');
    console.log('Successfully required react-native-purchases');
} catch (e) {
    console.error('Failed to require react-native-purchases:');
    console.error(e);
}
