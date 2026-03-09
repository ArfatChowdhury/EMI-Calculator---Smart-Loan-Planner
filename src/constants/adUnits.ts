const IS_DEV = __DEV__;

export const AdUnits = {
    // Banner Ad — shown at bottom of Home, Insights,
    // Compare, Budget, New Transaction screens
    banner: IS_DEV
        ? 'ca-app-pub-3940256099942544/6300978111'
        : 'ca-app-pub-3315420037530922/2872443719',

    // Interstitial Ad — shown on app launch (once/24hrs)
    // and before PDF export
    interstitial: IS_DEV
        ? 'ca-app-pub-3940256099942544/1033173712'
        : 'ca-app-pub-3315420037530922/1559362042',

    // Native Ad — shown as card in loan lists
    // every 3rd item in My Loans screen
    native: IS_DEV
        ? 'ca-app-pub-3940256099942544/2247696110'
        : 'ca-app-pub-3315420037530922/6620117037',
};
