import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    Pressable,
    View,
    Image,
    Button,
    useColorScheme,
    TouchableWithoutFeedback,
} from "react-native";
import { heightPixel, widthPixel } from "../../utils/fonts";
import Ripple from "react-native-material-ripple";
import { useSelector } from "react-redux";
import AppStyles from "../../styles/AppStyles";
import SecureStorage from "../../utils/SecureStorage";

export default TextModelContainer = ({ children, imageSource, isRiderImage = false, onRequestClose }) => {

    const { colorScheme } = useSelector(state => state.app);
    const [modelVisible, setModalVisible] = useState(true);
    const modelRef = useRef(null);
    const colorSet = AppStyles.colorSet[colorScheme ?? 'light'];
    const styles = getLocalStyles(colorSet);
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {

        SecureStorage.getUserData()
            .then(data => {
                if (data)
                    setProfileImage(data?.selfie)
            })
    }, [])


    return (
        <Modal
            ref={modelRef}
            animationType="fade"
            transparent
            visible
            backdropColor={'#000'}
            onRequestClose={onRequestClose}
            onDismiss={() => {
                // setModalVisible(true);
            }}
        >
            <TouchableWithoutFeedback onPress={onRequestClose}>

                <View style={styles.centeredView} >

                    <View style={styles.modalView}>

                        {children}

                    </View>

                </View>
            </TouchableWithoutFeedback>

        </Modal>
    );
};

const getLocalStyles = (colorSet) => {
    return StyleSheet.create({
        centeredView: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: "center",
            alignItems: "center",
            // marginBottom: heightPixel(56)
        },
        centerText: {
            textAlign: "center",
        },
        modalView: {
            backgroundColor: colorSet.mainThemeBackgroundColor,
            borderRadius: 16,
            // minHeight: widthPixel(304),
            width: widthPixel(327),
            // padding: widthPixel(16),
            alignItems: "center",
            elevation: 5,
        },
        imageContainer: {
            width: '100%',
        },
        button: {
            width: "100%",
            borderRadius: 12,
            padding: 10,
            elevation: 2,
            textAlign: "center",
            height: 48,
        },
        buttonOpen: {
            backgroundColor: "#F194FF",
        },
        buttonClose: {
            backgroundColor: "#2196F3",
        },
        textStyle: {
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
        },
        modalText: {
            marginBottom: 15,
            textAlign: "center",
        },
        welcomeMsg: {
            fontFamily: "Neue Montreal",
            color: "#1F2024",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 29,
            letterSpacing: 0.005,
            textAlign: "center",
        },
        buttonText: {
            color: "#fff",
            textAlign: "center",
        },

        boldText: {
            fontFamily: "Neue Montreal",
            color: "#1F2024",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 29,
            letterSpacing: 0.005,
            textAlign: "center",
        },
        tinyText: {
            fontFamily: "Neue Montreal",
            fontSize: 14,
            fontWeight: "500",
            lineHeight: 20,
            letterSpacing: 0,
            textAlign: "center",
            color: "#8F9098",
        },
        grayText: {
            fontFamily: "Neue Montreal",
            fontSize: 16,
            fontWeight: "400",
            lineHeight: 22,
            letterSpacing: 0,
            textAlign: "center",
            color: "#8F9098",
        },
        popTit: {
            fontFamily: "Neue Montreal",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 29,
            letterSpacing: 0.005,
            textAlign: "center",
            color: "#1F2024",
        },
        popMsg: {
            fontFamily: "Neue Montreal",
            fontSize: 14,
            fontWeight: "400",
            lineHeight: 20,
            letterSpacing: 0,
            textAlign: "center",
            color: "#8F9098",
        },
        doLater: {
            fontFamily: "Neue Montreal",
            fontSize: 14,
            fontWeight: "700",
            lineHeight: 17,
            letterSpacing: 0,
            textAlign: "left",
            color: "#8F9098",
        },
        info: {
            fontFamily: "Neue Montreal",
            fontSize: 14,
            fontWeight: "400",
            lineHeight: 20,
            letterSpacing: 0,
            textAlign: "center",
            color: "#8F9098",
            marginTop: 15,
        },
        amount: {
            fontFamily: "Neue Montreal",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 29,
            letterSpacing: 0.005,
            textAlign: "right",
            color: "#1F2024",
            flex: 1,
            textAlign: "end",
        },
        totalText: {
            fontFamily: "Neue Montreal",
            fontSize: 14,
            fontWeight: "400",
            lineHeight: 20,
            letterSpacing: 0,
            textAlign: "center",
            color: "#71727A",
        },
        colorMoney: {
            fontFamily: "Neue Montreal",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 29,
            letterSpacing: 0.005,
            textAlign: "center",
            color: "#3AC0A0",
        },
    });
};
