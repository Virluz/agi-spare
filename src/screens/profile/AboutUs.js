import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toolbar from '../../components/ui/Toolbar';
import { heightPixel } from '../../utils/fonts';

const FEATURE_CARDS = [
  {
    icon: require('../../../assets/images/about/expertise.png'),
    title: 'Our Expertise',
    description:
      'Specializing in the trading and supply of aerial platform spare parts, we are a dedicated part owned by skilled engineers who meticulously inspect and approve every component to ensure top performance.',
  },
  {
    icon: require('../../../assets/images/about/boom-lift.png'),
    title: 'Boom Lift Solutions',
    description:
      'We offer JLG and Genie boom lifts exports from the global market including and controls, making them ideal for high-altitude uses requiring mobility and flexibility.',
  },
  {
    icon: require('../../../assets/images/about/quality.png'),
    title: 'Commitment To Quality',
    description:
      'We prioritize safety and efficiency, sourcing original parts that meet the highest standards. Our dedication to unbeatable quality has made us a trusted partner in Mumbai and in the industry.',
  },
];

const AboutUs = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <Toolbar title="About Us" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require('../../../assets/images/about/hero.png')}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>About Us</Text>
            <Text style={styles.heroSubtitle}>
              Your trusted partner in high altitude equipment
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.sectionTitle}>Welcome to AGI Spare</Text>
            <Text style={styles.welcomeSubtitle}>
              Reaching New Heights in Safety and Service
            </Text>
            <Text style={styles.welcomeText}>
              Since 2014, Al-Gyas Infrastructure has specialized in supplying high-quality original and OEM spare parts for Aerial Work Platforms across India. Headquartered in Mumbai, we source parts from trusted global markets including Europe, the USA, the Middle East, and Far East Asia—ensuring reliability, performance, and safety in high-altitude operations. With a strong focus on quality assurance and customer satisfaction, we cater to a wide range of industries including construction, warehousing, infrastructure, manufacturing, logistics, and industrial maintenance.
            </Text>
          </View>
          <Image
            source={require('../../../assets/images/about/welcome.png')}
            style={styles.welcomeImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Us</Text>
          <Text style={styles.aboutText}>
            Since 2014, Al-Gyas Infrastructure has specialized in supplying high-quality original and OEM spare parts for Aerial Work Platforms across India. Headquartered in Mumbai, we source parts from trusted global markets including Europe, the USA, the Middle East, and Far East Asia—ensuring reliability, performance, and safety in high-altitude operations. Backed by years of industry expertise, Al-Gyas Infrastructure is committed to delivering durable, cost-effective, and performance-driven spare part solutions tailored to the evolving needs of modern access equipment. Through dependable sourcing, timely delivery, and technical
          </Text>

          <View style={styles.cards}>
            {FEATURE_CARDS.map(card => (
              <View key={card.title} style={styles.card}>
                <Image source={card.icon} style={styles.cardIcon} />
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardText}>{card.description}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('ContactUs')
            }
          >
            <Text style={styles.contactButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EEF8FF' },
  scrollView: { flex: 1, backgroundColor: '#EEF8FF' },
  content: { flexGrow: 1, paddingBottom: 40 },
  hero: { height: 700, justifyContent: 'flex-end' },
  heroImage: { resizeMode: 'cover', backgroundColor: '#000' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.20)' },
  heroContent: { padding: 24, paddingBottom: 28 },
  heroTitle: { color: '#fff', fontSize: 42, lineHeight: 46, fontWeight: '600' },
  heroSubtitle: { color: '#fff', fontSize: 16, lineHeight: 24, marginTop: 12 },
  welcomeSection: { backgroundColor: '#F2F8FD', paddingTop: 40 },
  welcomeContent: { paddingHorizontal: 24 },
  sectionTitle: { color: '#F27C03', fontSize: 24, lineHeight: 29, fontWeight: '600', textAlign: 'center' },
  welcomeSubtitle: { color: '#261F64', fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  welcomeText: { color: '#0B0B0B', fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 18 },
  welcomeImage: { width: '100%', height: heightPixel(220), marginTop: 28 },
  aboutSection: { backgroundColor: '#EEF8FF', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 36 },
  aboutTitle: { color: '#F27C03', fontSize: 32, lineHeight: 39, fontWeight: '600', textAlign: 'center' },
  aboutText: { color: '#0B0B0B', fontSize: 16, lineHeight: 26, textAlign: 'center', marginTop: 16 },
  cards: { marginTop: 40, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  cardIcon: { width: 42, height: 42, marginBottom: 14 },
  cardTitle: { color: '#261F64', fontSize: 20, lineHeight: 27, fontWeight: '600', marginBottom: 12 },
  cardText: { color: '#000', fontSize: 14, lineHeight: 22 },
  contactButton: { alignSelf: 'center', backgroundColor: '#F27C03', borderRadius: 4, marginTop: 24, minWidth: 132, paddingHorizontal: 32, paddingVertical: 12 },
  contactButtonText: { color: '#fff', fontSize: 14, fontWeight: '500', textAlign: 'center' },
});

export default AboutUs;
