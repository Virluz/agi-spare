import { axiosInstance } from './config';
import eventBus from '../service/EventBus';
import SecureStorage from '../utils/SecureStorage';
import { Platform } from 'react-native';
import { processPins } from '../utils/Helper';

export const securePost = async (endpoint, body = {}, extraHeaders = {}) => {

    try {


        return axiosInstance.post(endpoint, body);
        // const sslPins = await SecureStorage.getPins();
        // const iosPins = processPins(sslPins);

        // console.log("Pin length:", sslPins[0].length, sslPins[1].length, sslPins[2].length);
        // console.log("Pin length:", iosPins[0].length, iosPins[1].length, iosPins[2].length);
        // console.log("Is valid base64?", /^[A-Za-z0-9+/]+={0,2}$/.test(sslPins[0]));
        // console.log("sslPins", sslPins, axiosInstance.defaults.baseURL, endpoint);

        return new Promise((resolve, reject) => {
            fetch(`${axiosInstance.defaults.baseURL}${endpoint}`, {
                method: 'POST',

                timeoutInterval: 60000,

                headers: {
                    ...axiosInstance.defaults.headers.common,
                    ...extraHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
                .then(response => {
                    // Always resolve with status/data, even for 500s
                    response.text()
                        .then(text => {
                            let data;
                            try { data = JSON.parse(text) } catch { data = text }
                            resolve(data);
                        })
                        .catch(err => {
                            resolve({ status: response.status, ok: response.ok, data: text });
                        });
                })
                .catch(err => {
                    // Network/SSL errors
                    console.log("securePost error", err);
                    if (err?.bodyString) {
                        const data = JSON.parse(err.bodyString)
                        resolve(data);
                    }

                    if (err?.status === 401) {

                        eventBus.publish("session_expired");
                        return;
                    }
                    console.log("ERR", err);

                    if (err?.toLowerCase()?.includes('certificate')) {
                        // console.log("certificate err", err);
                        eventBus.publish("certificate_expired");
                    }

                    reject(err);
                });
        });

    } catch (error) {
        console.log("securePost error", error);
        // eventBus.publish('session_expired');

        return;
    }


};

