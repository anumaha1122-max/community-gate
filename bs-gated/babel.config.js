

module.exports = function (api) {

    const isWeb = api.caller((caller) => caller?.platform === 'web');

    return {
        presets: [
            [
                'babel-preset-expo',
                {

                    unstable_transformImportMeta: true,
                },
            ],
        ],
        plugins: [

            ...(!isWeb ? ['react-native-reanimated/plugin'] : []),
        ],
    };
};

