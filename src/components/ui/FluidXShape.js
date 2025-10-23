



// App.js
import React from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from "react-native";

const { width } = Dimensions.get("window");

export default function FluidXShape() {
    // sizes you can tweak
    const BAR_HEIGHT = 84;
    const CIRCLE_DIAM = 170;
    const SIDE_PADDING = 24;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.screenBackground}>
                {/* Outer bar container (for shading effect you see behind the pill) */}
                <View style={styles.outerStrip}>
                    {/* Centered pill (the white rounded bar) */}
                    <View
                        style={[
                            styles.pill,
                            {
                                height: BAR_HEIGHT,
                                marginHorizontal: SIDE_PADDING,
                                borderRadius: BAR_HEIGHT / 2,
                            },
                        ]}
                    >
                        {/* LEFT ICONS */}
                        <View style={styles.iconRow}>
                            <TouchableOpacity style={styles.iconTouch}>
                                {/* Replace with your SVG/Icon component or Image */}
                                <View style={styles.fakeIcon}>
                                    <Text style={styles.iconText}>⎈</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconTouch}>
                                <View style={styles.fakeIconSecondary}>
                                    <Text style={[styles.iconText, { color: "#c33" }]}>⬚</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Right side icons (space left for center circle overlap) */}
                        <View style={styles.iconRowRight}>
                            <TouchableOpacity style={styles.iconTouch}>
                                <View style={styles.fakeIcon}><Text style={styles.iconText}>🛒</Text></View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconTouch}>
                                <View style={styles.fakeIcon}><Text style={styles.iconText}>🎁</Text></View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* CENTER CIRCLE (overlaps the pill) */}
                    <View
                        style={[
                            styles.centerCircleWrap,
                            {
                                width: CIRCLE_DIAM,
                                height: CIRCLE_DIAM,
                                borderRadius: CIRCLE_DIAM / 2,
                                marginTop: -CIRCLE_DIAM / 2 + BAR_HEIGHT / 2, // lift it to overlap
                            },
                        ]}
                    >
                        {/* outer subtle ring */}
                        <View style={styles.centerCircleShadow}>
                            {/* Replace this Image with your logo; use require(...) for local file */}
                            <Image
                                source={require("../../../assets/images/fluid.png")} // replace with your logo file
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#e9e9ea" },
    screenBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    outerStrip: {
        width: width,
        alignItems: "center",
    },

    pill: {
        width: width - 48, // leave margins to edges
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        // subtle drop shadow for iOS/Android
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
    },

    iconRowRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
    },

    iconTouch: {
        padding: 8,
    },

    fakeIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    fakeIconSecondary: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    iconText: {
        fontSize: 22,
    },

    centerCircleWrap: {
        position: "absolute",
        alignSelf: "center",
        zIndex: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    centerCircleShadow: {
        flex: 1,
        width: "100%",
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        // ring / subtle shadow
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 18,
            },
            android: {
                elevation: 6,
            },
        }),
    },

    logo: {
        width: "70%",
        height: "70%",
    },
});
