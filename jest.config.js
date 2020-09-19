module.exports = {
    verbose: true,
    transform: {
        "\\.ts": "ts-jest"
    },
    testRegex: "/test/unit/.*\\.spec\\.ts$",
    moduleFileExtensions: [
        "ts",
        "js",
    ]
};
