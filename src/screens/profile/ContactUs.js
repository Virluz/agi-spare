import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react-native';
import Toolbar from '../../components/ui/Toolbar';

const FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwQYED64l6PW1U8i7Lw_PtVnTEA95V-ddeROrUJzbua50qbsOC4TEv1GKmy8ec6Xdxx6A/exec';
const DIRECTIONS_URL = 'https://maps.app.goo.gl/f7XDBnhg6aVkVXFz7';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const updateField = field => value => setForm(current => ({ ...current, [field]: value }));

  const openLink = async url => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  const openPhone = async phoneNumber => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const telUrl = `tel:${cleanNumber}`;
    try {
      await Linking.openURL(telUrl);
    } catch (error) {
      Alert.alert('Unable to open phone app', `Please call: ${phoneNumber}`);
    }
  };

  const openEmail = async emailAddress => {
    const gmailDeepLink = `googlegmail:///co?to=${emailAddress}`;
    const mailtoUrl = `mailto:${emailAddress}`;

    try {
      const canOpenGmail = await Linking.canOpenURL(gmailDeepLink);
      if (canOpenGmail) {
        await Linking.openURL(gmailDeepLink);
        return;
      }
    } catch (e) { }

    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      Alert.alert('Unable to open email app', `Please send an email to: ${emailAddress}`);
    }
  };

  const submitForm = async () => {
    if (!form.name || !form.email || !form.phone || !form.message) {
      Alert.alert('Missing details', 'Please complete all fields before sending your message.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const resText = await response.text();
      let resJson;
      try {
        resJson = JSON.parse(resText);
      } catch (e) { }

      if (resJson && resJson.success === false) {
        throw new Error(resJson.message || 'Submission failed');
      }

      setForm({ name: '', email: '', phone: '', message: '' });
      Alert.alert('Submitted successfully', 'Thank you. We will get back to you shortly.');
    } catch (error) {
      console.error('Contact submit error:', error);
      Alert.alert('Unable to send', 'Please try again or use the call or email options above.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Toolbar title="Contact Us" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Contact Us</Text>
          <Text style={styles.subheading}>Have any questions? We'd love to hear from you.</Text>
        </View>

        <View style={styles.quickCard}>
          <QuickContact
            icon={<Phone size={18} color="#fff" />}
            title="Call Us"
            detail="+91-9223434389"
            action="Call Now"
            onPress={() => openPhone('+919223434389')}
          />
          <QuickContact
            icon={<Mail size={18} color="#fff" />}
            title="Email Us"
            detail="agispares@gmail.com"
            action="Email Now"
            onPress={() => openEmail('agispares@gmail.com')}
          />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formHeading}>Get in Touch</Text>
          <TextInput style={styles.field} placeholder="Name" placeholderTextColor="#8E8E8E" value={form.name} onChangeText={updateField('name')} />
          <TextInput style={styles.field} placeholder="Email" placeholderTextColor="#8E8E8E" value={form.email} onChangeText={updateField('email')} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.field} placeholder="Phone Number" placeholderTextColor="#8E8E8E" value={form.phone} onChangeText={updateField('phone')} keyboardType="phone-pad" />
          <TextInput style={[styles.field, styles.messageField]} placeholder="Write a message" placeholderTextColor="#8E8E8E" value={form.message} onChangeText={updateField('message')} multiline textAlignVertical="top" />
          <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} disabled={submitting} onPress={submitForm}>
            <Text style={styles.submitText}>{submitting ? 'Sending...' : 'Send Message'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <Image source={require('../../../assets/images/contact/location.png')} style={styles.locationIcon} />
            <Text style={styles.cardTitle}>Location</Text>
          </View>
          <Text style={styles.locationText}>Panvel Mumbra Road, Plot No 58, Rohinjan, Next to Reliance Pri Pump, Taluka Panvel, Dist Raigad PIN code 410208</Text>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.85} onPress={() => openLink(DIRECTIONS_URL)}>
            <Text style={styles.actionText}>Get Direction</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mapWrap} activeOpacity={0.9} onPress={() => openLink(DIRECTIONS_URL)}>
          <Image source={require('../../../assets/images/contact/map.png')} style={styles.map} resizeMode="cover" />
        </TouchableOpacity>

        <View style={styles.details}>
          <Detail icon={<MapPin size={18} color="#F27C03" />} text="Panvel Mumbra Road, Plot No 58, Rohinjan, Next to Reliance Pet Pump, Taluka Panvel, Dist Raigad PIDS" onPress={() => openLink(DIRECTIONS_URL)} />
          <Detail icon={<Phone size={18} color="#F27C03" />} text="+91 99300 00842" onPress={() => openPhone('+919930000842')} />
          <Detail icon={<Mail size={18} color="#F27C03" />} text="agispares@al-gyas.com" onPress={() => openEmail('agispares@al-gyas.com')} />
          <Detail icon={<Clock3 size={18} color="#F27C03" />} text="All days, 10:00 to 19:00 IST (Except for public holiday)" />
        </View>
      </ScrollView>
    </View>
  );
};

const QuickContact = ({ icon, title, detail, action, onPress }) => (
  <View style={styles.quickItem}>
    <View>
      <View style={styles.cardHeader}>
        <View style={styles.quickIcon}>{icon}</View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.quickText}>{detail}</Text>
    </View>
    <TouchableOpacity style={styles.outlineAction} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.outlineActionText}>{action}</Text>
    </TouchableOpacity>
  </View>
);

const Detail = ({ icon, text, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity style={styles.detail} activeOpacity={0.7} onPress={onPress}>
        {icon}
        <Text style={[styles.detailText, { textDecorationLine: 'underline' }]}>{text}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.detail}>
      {icon}
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { backgroundColor: '#F3F2F8', padding: 18, paddingTop: 32, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 20 },
  heading: { color: '#261F64', fontSize: 32, fontWeight: '600', lineHeight: 39, marginBottom: 10 },
  subheading: { color: '#000', fontSize: 16, lineHeight: 23, textAlign: 'center' },
  quickCard: { backgroundColor: '#fff', borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  quickItem: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quickIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: '#F27C03' },
  locationIcon: { width: 32, height: 32, borderRadius: 4 },
  cardTitle: { color: '#000', fontSize: 20, fontWeight: '500', lineHeight: 24 },
  quickText: { color: '#000', fontSize: 12, lineHeight: 17, marginTop: 12 },
  outlineAction: { borderColor: '#000', borderRadius: 20, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 10 },
  outlineActionText: { color: '#242051', fontSize: 12, lineHeight: 15 },
  formCard: { backgroundColor: '#F4F0F8', borderRadius: 8, marginTop: 20, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  formHeading: { color: '#000', fontSize: 20, fontWeight: '500', lineHeight: 24, marginBottom: 22, textAlign: 'center' },
  field: { backgroundColor: '#fff', borderColor: '#D8D8D8', borderRadius: 6, borderWidth: 1, color: '#111', fontSize: 14, marginBottom: 24, minHeight: 42, paddingHorizontal: 12, paddingVertical: 10 },
  messageField: { minHeight: 80 },
  submitButton: { alignItems: 'center', backgroundColor: '#F27C03', borderRadius: 20, justifyContent: 'center', minHeight: 42 },
  submitText: { color: '#000', fontSize: 14, fontWeight: '500' },
  locationCard: { backgroundColor: '#fff', borderRadius: 8, marginTop: 20, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  locationText: { color: '#000', fontSize: 12, lineHeight: 17, marginBottom: 16, marginTop: 12 },
  actionButton: { alignSelf: 'flex-start', backgroundColor: '#F27C03', borderRadius: 20, paddingHorizontal: 22, paddingVertical: 10 },
  actionText: { color: '#111', fontSize: 12, lineHeight: 15 },
  mapWrap: { borderRadius: 12, elevation: 2, marginTop: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  map: { height: 180, width: '100%' },
  details: { gap: 16, paddingTop: 12 },
  detail: { flexDirection: 'row', gap: 12 },
  detailText: { color: '#111', flex: 1, fontSize: 12, lineHeight: 17 },
});

export default ContactUs;
