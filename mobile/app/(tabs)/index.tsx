import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image, ImageBackground, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Import images
const backgroundImage = require('@/assets/images/background.png');
const bloodDonationImage = require('@/assets/images/blood-donation.jpg');
const communityImage = require('@/assets/images/community.jpg');
const medicalCareImage = require('@/assets/images/medical-care.jpg');
const healthcareSupportImage = require('@/assets/images/healthcare-support.jpg');
const compassionImage = require('@/assets/images/compassion.jpg');

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const [activeLink, setActiveLink] = useState('Home');
  const [email, setEmail] = useState('');

  // Refs for scroll-to-section functionality
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<{ [key: string]: number }>({});

  // Handle navbar link press - scroll to section
  const handleNavPress = (link: string) => {
    setActiveLink(link);
    const position = sectionPositions.current[link];
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position, animated: true });
    }
  };

  // Store section position when layout is measured
  const onSectionLayout = (sectionName: string) => (event: any) => {
    const { y } = event.nativeEvent.layout;
    sectionPositions.current[sectionName] = y;
  };

  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case 'admin':
          router.replace('/(admin)/' as any);
          break;
        case 'ngo':
          router.replace('/(ngo)/' as any);
          break;
        case 'blood_bank':
          router.replace('/(blood-bank)/' as any);
          break;
        default:
          router.replace('/(user)/' as any);
      }
    }
  }, [user, loading]);

  const navLinks = ['Home', 'About', 'Blood Types', 'How It Works', 'Contact'];

  const bloodTypes = [
    { type: 'A+', color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fecaca', percent: '35.7%', donatesTo: 'A+, AB+', receivesFrom: 'A+, A-, O+, O-' },
    { type: 'A-', color: '#f97316', bgColor: '#fff7ed', borderColor: '#fed7aa', percent: '6.3%', donatesTo: 'A+, A-, AB+, AB-', receivesFrom: 'A-, O-' },
    { type: 'B+', color: '#eab308', bgColor: '#fefce8', borderColor: '#fef08a', percent: '8.5%', donatesTo: 'B+, AB+', receivesFrom: 'B+, B-, O+, O-' },
    { type: 'B-', color: '#22c55e', bgColor: '#f0fdf4', borderColor: '#bbf7d0', percent: '1.5%', donatesTo: 'B+, B-, AB+, AB-', receivesFrom: 'B-, O-' },
    { type: 'AB+', color: '#14b8a6', bgColor: '#f0fdfa', borderColor: '#99f6e4', percent: '3.4%', donatesTo: 'AB+', receivesFrom: 'All Types' },
    { type: 'AB-', color: '#06b6d4', bgColor: '#ecfeff', borderColor: '#a5f3fc', percent: '0.6%', donatesTo: 'AB+, AB-', receivesFrom: 'A-, B-, AB-, O-' },
    { type: 'O+', color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#bfdbfe', percent: '37.4%', donatesTo: 'O+, A+, B+, AB+', receivesFrom: 'O+, O-' },
    { type: 'O-', color: '#8b5cf6', bgColor: '#f5f3ff', borderColor: '#ddd6fe', percent: '6.6%', donatesTo: 'All Types', receivesFrom: 'O-' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ========== HERO SECTION (Home) ========== */}
        <ImageBackground
          source={backgroundImage}
          style={styles.heroSection}
          imageStyle={styles.heroBackgroundImage}
          onLayout={onSectionLayout('Home')}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          >
            {/* Header Row 1: Logo + Auth */}
            <View style={styles.headerRow1}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Feather name="droplet" size={16} color="white" />
                </View>
                <Text style={styles.logoText}>Bharakt</Text>
              </View>
              <View style={styles.authButtons}>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity style={styles.loginBtn}>
                    <Text style={styles.loginBtnText}>Login</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity style={styles.registerBtn}>
                    <Text style={styles.registerBtnText}>Register</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Header Row 2: Navigation Pills - CENTERED */}
            <View style={styles.navWrapper}>
              <View style={styles.navContainer}>
                {navLinks.map((link) => (
                  <TouchableOpacity
                    key={link}
                    style={[styles.navPill, activeLink === link && styles.navPillActive]}
                    onPress={() => handleNavPress(link)}
                  >
                    <Text style={[styles.navPillText, activeLink === link && styles.navPillTextActive]}>
                      {link}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <View style={styles.taglineContainer}>
                <View style={styles.taglineDot} />
                <Text style={styles.taglineText}>SAVING LIVES TOGETHER</Text>
              </View>

              <Text style={styles.heroTitle}>
                Together We Support{'\n'}
                <Text style={styles.heroTitleHighlight}>Educate and Heal</Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                Every donation helps a family grow stronger, healthier, and more secure. Together, we build a future full of possibilities.
              </Text>

              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <View style={[styles.tagDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={styles.tagText}>100% Transparent</Text>
                </View>
                <View style={styles.tag}>
                  <View style={[styles.tagDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={styles.tagText}>Verified Donors</Text>
                </View>
              </View>

              {/* CTA Card */}
              <View style={styles.ctaCard}>
                <View style={styles.ctaCardHeader}>
                  <View style={styles.ctaCardLogoContainer}>
                    <View style={styles.ctaCardLogo}>
                      <Feather name="droplet" size={18} color="white" />
                    </View>
                    <Text style={styles.ctaCardLogoText}>Bharakt</Text>
                  </View>
                  <View style={styles.ctaCardBadge}>
                    <Text style={styles.ctaCardBadgeText}>LIVE IMPACT</Text>
                  </View>
                </View>

                <View style={styles.ctaCardIcon}>
                  <Feather name="heart" size={24} color="white" />
                </View>

                <Text style={styles.ctaCardTitle}>Make an Immediate Impact</Text>
                <Text style={styles.ctaCardSubtitle}>
                  Your contribution provides essential aid to families in need with care and dignity.
                </Text>

                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity style={styles.donateBtn}>
                    <Text style={styles.donateBtnText}>Donate Now</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity style={styles.requestBtn}>
                    <Text style={styles.requestBtnText}>Request Blood</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <Feather name="users" size={18} color="white" />
                  </View>
                  <Text style={styles.statValue}>500+</Text>
                  <Text style={styles.statLabel}>ACTIVE VOLUNTEERS</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <Feather name="heart" size={18} color="white" />
                  </View>
                  <Text style={styles.statValue}>50,000+</Text>
                  <Text style={styles.statLabel}>LIVES SAVED</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* ========== FEATURES SECTION (About) ========== */}
        <View style={styles.featuresSection} onLayout={onSectionLayout('About')}>
          <View style={styles.featureCard}>
            <Image source={bloodDonationImage} style={styles.featureImage} />
            <View style={styles.featureIconBadge}>
              <Feather name="heart" size={24} color="#dc2626" />
            </View>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureCardTitle}>Compassion-Driven Support</Text>
              <Text style={styles.featureCardDesc}>
                We provide essential aid to families in need with care, respect, and dignity.
              </Text>
            </View>
          </View>

          <View style={styles.featureCardAlt}>
            <View style={styles.featureIconAlt}>
              <Feather name="shield" size={24} color="#dc2626" />
            </View>
            <Text style={styles.featureCardTitle}>Transparent & Trusted</Text>
            <Text style={styles.featureCardDesc}>
              Every donation is used responsibly, with clear reporting and real impact updates.
            </Text>
            <Image source={medicalCareImage} style={styles.featureImageSmall} />
          </View>

          <View style={styles.featureCardSmall}>
            <Text style={styles.featureCardTitleSmall}>Community-Focused Programs</Text>
            <Text style={styles.featureCardDescSmall}>
              Our initiatives empower local communities through education, health support, and sustainable relief.
            </Text>
          </View>

          <View style={styles.featureCardImage}>
            <Image source={communityImage} style={styles.communityImage} />
            <View style={styles.communityOverlay}>
              <View style={styles.communityBadge}>
                <Feather name="droplet" size={16} color="#dc2626" />
                <Text style={styles.communityBadgeText}>Bharakt</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ========== IMPACT SECTION ========== */}
        <View style={styles.impactSection}>
          <Text style={styles.impactSectionTitle}>How Your Support Helps</Text>
          <Text style={styles.impactSectionHighlight}>Change Lives</Text>
          <Text style={styles.impactSectionSubtitle}>
            Explore the programs that directly impact families and communities. Every contribution you make goes toward creating real, measurable change.
          </Text>

          {[
            { icon: 'heart', title: 'Support Life-Saving Healthcare', desc: 'Provide medical checkups, essential medicines, and emergency treatments for families who cannot afford healthcare.', image: healthcareSupportImage },
            { icon: 'users', title: 'Compassion-Driven Support', desc: 'Provide essential monthly food packs to families struggling with hunger. Your support ensures they receive nutritious meals and daily comfort.', image: compassionImage },
            { icon: 'book-open', title: 'Give Children a Chance to Learn', desc: 'Help underprivileged children access quality education through books, uniforms, and school supplies. Your contribution shapes their future.', image: bloodDonationImage },
          ].map((item, index) => (
            <View key={index} style={styles.impactCard}>
              <View style={styles.impactCardLeft}>
                <View style={styles.impactCardHeader}>
                  <View style={styles.impactCardIcon}>
                    <Feather name={item.icon as any} size={20} color="#dc2626" />
                  </View>
                  <Text style={styles.impactCardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.impactCardDesc}>{item.desc}</Text>
              </View>
              <View style={styles.impactCardRight}>
                <TouchableOpacity style={styles.impactDonateBtn}>
                  <Text style={styles.impactDonateBtnText}>Donate Now</Text>
                </TouchableOpacity>
                <Image source={item.image} style={styles.impactCardImage} />
              </View>
            </View>
          ))}

          {/* Doctor Image with Stats */}
          <View style={styles.doctorSection}>
            <Image source={healthcareSupportImage} style={styles.doctorImage} />
            <View style={styles.doctorStatsRow}>
              <View style={styles.doctorStatCard}>
                <Text style={styles.doctorStatValue}>8,500+</Text>
                <Text style={styles.doctorStatLabel}>Medical Aid Given</Text>
              </View>
              <View style={styles.doctorStatCard}>
                <Text style={styles.doctorStatValue}>12,000+</Text>
                <Text style={styles.doctorStatLabel}>Children Supported</Text>
              </View>
            </View>
          </View>

          {/* Vision & Mission */}
          <View style={styles.visionCard}>
            <View style={styles.visionIcon}>
              <Feather name="shield" size={20} color="#dc2626" />
            </View>
            <Text style={styles.visionTitle}>Vision Statement</Text>
            <Text style={styles.visionDesc}>
              We strive to create a future where every child has the opportunity to learn, every family has access to basic needs, and every community can grow with hope, security.
            </Text>
          </View>

          <View style={styles.visionCard}>
            <View style={styles.visionIcon}>
              <Feather name="home" size={20} color="#dc2626" />
            </View>
            <Text style={styles.visionTitle}>Mission Statement</Text>
            <Text style={styles.visionDesc}>
              We are dedicated to supporting vulnerable communities by providing food, education, healthcare, and essential resources with compassion and dignity.
            </Text>
          </View>
        </View>

        {/* ========== BLOOD TYPES SECTION ========== */}
        <View style={styles.bloodTypesSection} onLayout={onSectionLayout('Blood Types')}>
          <Text style={styles.sectionTag}>BLOOD TYPES</Text>
          <Text style={styles.sectionTitle}>Understanding Blood Compatibility</Text>
          <Text style={styles.sectionSubtitle}>
            Learn about different blood types and their compatibility for safe transfusions
          </Text>

          <View style={styles.bloodTypesGrid}>
            {bloodTypes.map((blood) => (
              <View key={blood.type} style={styles.bloodTypeCardWrapper}>
                <View style={[styles.bloodTypeCard, { backgroundColor: blood.bgColor, borderColor: blood.borderColor }]}>
                  <View style={styles.bloodTypeHeader}>
                    <View style={[styles.bloodTypeBadge, { backgroundColor: blood.color }]}>
                      <Text style={styles.bloodTypeText}>{blood.type}</Text>
                    </View>
                    <Text style={styles.bloodTypePercent}>{blood.percent}</Text>
                  </View>
                  <View style={styles.bloodTypeInfo}>
                    <Text style={styles.bloodTypeInfoLabel}>DONATES TO</Text>
                    <Text style={styles.bloodTypeInfoValue}>{blood.donatesTo}</Text>
                  </View>
                  <View style={styles.bloodTypeInfo}>
                    <Text style={styles.bloodTypeInfoLabel}>RECEIVES FROM</Text>
                    <Text style={styles.bloodTypeInfoValue}>{blood.receivesFrom}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ========== HOW IT WORKS SECTION ========== */}
        <ImageBackground
          source={backgroundImage}
          style={styles.howItWorksSection}
          imageStyle={{ opacity: 0.1 }}
          onLayout={onSectionLayout('How It Works')}
        >
          <Text style={styles.sectionTag}>HOW IT WORKS</Text>
          <Text style={styles.sectionTitle}>Simple Steps to Save Lives</Text>
          <Text style={styles.sectionSubtitle}>
            Our streamlined process makes blood donation easier than ever
          </Text>

          {[
            { num: '01', icon: 'user-plus', title: 'Register', desc: 'Create your account in minutes. Provide basic health information and verify your identity.' },
            { num: '02', icon: 'droplet', title: 'Request or Donate', desc: 'Find nearby donors when you need blood, or respond to requests from those in need.' },
            { num: '03', icon: 'heart', title: 'Save Lives', desc: 'Complete the donation and become a hero. Track your impact and inspire others.' },
          ].map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <View style={styles.stepIcon}>
                  <Feather name={step.icon as any} size={24} color="#dc2626" />
                </View>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
              <Text style={styles.stepNumber}>{step.num}</Text>
            </View>
          ))}
        </ImageBackground>

        {/* ========== STATS GRID SECTION ========== */}
        <View style={styles.statsGridSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statsGridCardWrapper}>
              <View style={styles.statsGridCard}>
                <View style={[styles.statsGridIcon, { backgroundColor: '#f0f9ff' }]}>
                  <Feather name="users" size={20} color="#0ea5e9" />
                </View>
                <Text style={styles.statsGridValue}>15,000+</Text>
                <Text style={styles.statsGridLabel}>Active Donors</Text>
              </View>
            </View>
            <View style={styles.statsGridCardWrapper}>
              <View style={styles.statsGridCard}>
                <View style={[styles.statsGridIcon, { backgroundColor: '#f0fdf4' }]}>
                  <Feather name="home" size={20} color="#22c55e" />
                </View>
                <Text style={styles.statsGridValue}>250+</Text>
                <Text style={styles.statsGridLabel}>Blood Banks</Text>
              </View>
            </View>
            <View style={styles.statsGridCardWrapper}>
              <View style={styles.statsGridCard}>
                <View style={[styles.statsGridIcon, { backgroundColor: '#fef3c7' }]}>
                  <Feather name="activity" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.statsGridValue}>120+</Text>
                <Text style={styles.statsGridLabel}>Partner NGOs</Text>
              </View>
            </View>
            <View style={styles.statsGridCardWrapper}>
              <View style={styles.statsGridCard}>
                <View style={[styles.statsGridIcon, { backgroundColor: '#fef2f2' }]}>
                  <Feather name="heart" size={20} color="#ef4444" />
                </View>
                <Text style={styles.statsGridValue}>50,000+</Text>
                <Text style={styles.statsGridLabel}>Lives Saved</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ========== NEWSLETTER/STAY CONNECTED SECTION ========== */}
        <View style={styles.newsletterWrapper}>
          <View style={styles.newsletterCard}>
            <ImageBackground
              source={communityImage}
              style={styles.newsletterBg}
              imageStyle={styles.newsletterBgImage}
            >
              <View style={styles.newsletterContent}>
                <View style={styles.newsletterTagContainer}>
                  <View style={styles.newsletterTagDot} />
                  <Text style={styles.newsletterTag}>STAY CONNECTED</Text>
                </View>
                <Text style={styles.newsletterTitle}>Get Updates That{`\n`}Make a Difference</Text>
                <View style={styles.newsletterInputWrapper}>
                  <TextInput
                    style={styles.newsletterInput}
                    placeholder="Enter Your Email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity style={styles.subscribeBtn}>
                  <Text style={styles.subscribeBtnText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* ========== JOIN COMMUNITY (DARK CARD WITH GRADIENT) ========== */}
        <View style={styles.joinSectionWrapper}>
          <ImageBackground
            source={backgroundImage}
            style={styles.joinBgWrapper}
            imageStyle={styles.joinBgImage}
          >
            <LinearGradient
              colors={['rgba(15,23,42,0.95)', 'rgba(30,41,59,0.98)']}
              style={styles.joinGradient}
            >
              <View style={styles.joinSection}>
                <Text style={styles.joinTag}>JOIN OUR COMMUNITY</Text>
                <Text style={styles.joinTitle}>
                  Be Part of Something{`\n`}
                  <Text style={styles.joinTitleHighlight}>Bigger</Text>
                </Text>
                <Text style={styles.joinSubtitle}>
                  Connect with a community of compassionate individuals dedicated to saving lives. Every member makes a difference.
                </Text>

                <View style={styles.joinButtonsRow}>
                  <Link href="/(auth)/register" asChild>
                    <TouchableOpacity style={styles.joinBtnPrimary}>
                      <Text style={styles.joinBtnPrimaryText}>Get Started</Text>
                      <Feather name="arrow-right" size={16} color="white" />
                    </TouchableOpacity>
                  </Link>
                  <TouchableOpacity style={styles.joinBtnSecondary}>
                    <Text style={styles.joinBtnSecondaryText}>Learn More</Text>
                    <Feather name="arrow-right" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.joinStatsGrid}>
                  <View style={styles.joinStatCardWrapper}>
                    <View style={styles.joinStatCard}>
                      <Text style={styles.joinStatValue}>24/7</Text>
                      <Text style={styles.joinStatLabel}>Emergency{`\n`}Support</Text>
                    </View>
                  </View>
                  <View style={styles.joinStatCardWrapper}>
                    <View style={styles.joinStatCard}>
                      <Text style={styles.joinStatValue}>100%</Text>
                      <Text style={styles.joinStatLabel}>Verified Donors</Text>
                    </View>
                  </View>
                  <View style={styles.joinStatCardWrapper}>
                    <View style={styles.joinStatCard}>
                      <Text style={styles.joinStatValue}>35km</Text>
                      <Text style={styles.joinStatLabel}>Coverage Radius</Text>
                    </View>
                  </View>
                  <View style={styles.joinStatCardWrapper}>
                    <View style={styles.joinStatCard}>
                      <Text style={styles.joinStatValue}>Free</Text>
                      <Text style={styles.joinStatLabel}>Forever</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* ========== FOOTER (Contact) ========== */}
        <View style={styles.footer} onLayout={onSectionLayout('Contact')}>
          <View style={styles.footerTop}>
            <View style={styles.footerLogoContainer}>
              <View style={styles.footerLogoIcon}>
                <Feather name="droplet" size={16} color="white" />
              </View>
              <Text style={styles.footerLogoText}>Bharakt</Text>
            </View>
            <Text style={styles.footerDesc}>
              Bharakt is dedicated to connecting blood donors with those in need, making life-saving blood accessible to everyone, everywhere.
            </Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.socialIcon}>
                <Feather name="twitter" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Feather name="facebook" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Feather name="instagram" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Feather name="message-circle" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerLinks}>
            <Text style={styles.footerLinksTitle}>Quick Links</Text>
            <TouchableOpacity onPress={() => handleNavPress('About')}>
              <Text style={styles.footerLink}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavPress('How It Works')}>
              <Text style={styles.footerLink}>How It Works</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavPress('Blood Types')}>
              <Text style={styles.footerLink}>Blood Types</Text>
            </TouchableOpacity>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Become a Donor</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Request Blood</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.footerContact}>
            <Text style={styles.footerLinksTitle}>Contact</Text>
            <View style={styles.footerContactItem}>
              <Feather name="phone" size={14} color="#64748b" />
              <Text style={styles.footerContactText}>+1 (800) BLOOD-LINK</Text>
            </View>
            <View style={styles.footerContactItem}>
              <Feather name="mail" size={14} color="#64748b" />
              <Text style={styles.footerContactText}>support@bharakt.org</Text>
            </View>
            <View style={styles.footerContactItem}>
              <Feather name="map-pin" size={14} color="#64748b" />
              <Text style={styles.footerContactText}>123 Healthcare Ave,{'\n'}Medical District, MD 12345</Text>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>© 2026 Bharakt. All rights reserved.</Text>
            <View style={styles.footerPolicies}>
              <TouchableOpacity><Text style={styles.footerPolicy}>Privacy Policy</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerPolicy}>Terms of Service</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerPolicy}>Cookie Policy</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },

  // Hero
  heroSection: { minHeight: height * 0.95 },
  heroBackgroundImage: {
    resizeMode: 'cover',
    // Position like website: object-[37%_20%]
    // In RN we approximate with position values
  },
  heroGradient: { flex: 1, paddingTop: 50, minHeight: height * 0.95 },
  headerRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 32, height: 32, backgroundColor: '#dc2626', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: 'white', fontSize: 16, fontFamily: 'DMSans_600SemiBold', marginLeft: 8 },
  authButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  loginBtnText: { color: 'white', fontSize: 12, fontFamily: 'DMSans_500Medium' },
  registerBtn: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  registerBtnText: { color: '#1e293b', fontSize: 12, fontFamily: 'DMSans_500Medium' },

  // CENTERED Navigation
  navWrapper: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 },
  navContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 24, paddingHorizontal: 6, paddingVertical: 6 },
  navPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  navPillActive: { backgroundColor: 'white' },
  navPillText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'DMSans_500Medium' },
  navPillTextActive: { color: '#1e293b' },

  heroContent: { paddingHorizontal: 24, paddingTop: 16 },
  taglineContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  taglineDot: { width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4 },
  taglineText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontFamily: 'DMSans_500Medium', letterSpacing: 1, marginLeft: 8 },
  heroTitle: { color: 'white', fontSize: 36, fontFamily: 'PlayfairDisplay_400Regular', lineHeight: 44, marginBottom: 24 },
  heroTitleHighlight: { color: '#f87171', fontFamily: 'PlayfairDisplay_400Regular_Italic' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: 'DMSans_400Regular', lineHeight: 26, marginBottom: 32 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10 },
  tagDot: { width: 8, height: 8, borderRadius: 4 },
  tagText: { color: 'white', fontSize: 13, fontFamily: 'DMSans_500Medium', marginLeft: 10 },
  ctaCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 32, padding: 24, marginBottom: 16 },
  ctaCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  ctaCardLogoContainer: { flexDirection: 'row', alignItems: 'center' },
  ctaCardLogo: { width: 40, height: 40, backgroundColor: '#dc2626', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  ctaCardLogoText: { color: 'white', fontSize: 18, fontFamily: 'DMSans_500Medium', marginLeft: 12 },
  ctaCardBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  ctaCardBadgeText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'DMSans_500Medium', letterSpacing: 1 },
  ctaCardIcon: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  ctaCardTitle: { color: 'white', fontSize: 21, fontFamily: 'DMSans_600SemiBold', marginBottom: 12 },
  ctaCardSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 22, marginBottom: 24 },
  donateBtn: { backgroundColor: '#dc2626', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  donateBtnText: { color: 'white', fontSize: 16, fontFamily: 'DMSans_500Medium' },
  requestBtn: { height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  requestBtnText: { color: 'white', fontSize: 16, fontFamily: 'DMSans_500Medium' },
  statsRow: { flexDirection: 'row', gap: 16, paddingBottom: 40 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 16, alignItems: 'center' },
  statIcon: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { color: 'white', fontSize: 24, fontFamily: 'DMSans_700Bold', marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'DMSans_500Medium' },

  // Features
  featuresSection: { padding: 20, backgroundColor: '#f8fafc' },
  featureCard: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  featureImage: { width: '100%', height: 180, resizeMode: 'cover' },
  featureIconBadge: { position: 'absolute', left: 16, top: 140, width: 48, height: 48, backgroundColor: 'white', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  featureCardContent: { padding: 24, paddingTop: 16 },
  featureCardTitle: { color: '#1e293b', fontSize: 18, fontFamily: 'DMSans_600SemiBold', marginBottom: 8 },
  featureCardDesc: { color: '#64748b', fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 22 },
  featureCardAlt: { backgroundColor: 'white', borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  featureIconAlt: { width: 48, height: 48, backgroundColor: '#fef2f2', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  featureImageSmall: { width: '100%', height: 140, borderRadius: 16, marginTop: 16, resizeMode: 'cover' },
  featureCardSmall: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  featureCardTitleSmall: { color: '#1e293b', fontSize: 14, fontFamily: 'DMSans_600SemiBold', marginBottom: 8 },
  featureCardDescSmall: { color: '#64748b', fontSize: 12, fontFamily: 'DMSans_400Regular', lineHeight: 18 },
  featureCardImage: { borderRadius: 24, overflow: 'hidden', marginBottom: 16, height: 200 },
  communityImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  communityOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  communityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, alignSelf: 'flex-start' },
  communityBadgeText: { color: '#64748b', fontSize: 12, fontFamily: 'DMSans_500Medium', marginLeft: 8 },

  // Impact
  impactSection: { padding: 20, backgroundColor: '#f8fafc' },
  impactSectionTitle: { color: '#1e293b', fontSize: 28, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 4 },
  impactSectionHighlight: { color: '#dc2626', fontSize: 28, fontFamily: 'PlayfairDisplay_400Regular_Italic', marginBottom: 16 },
  impactSectionSubtitle: { color: '#64748b', fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 22, marginBottom: 24 },
  impactCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row' },
  impactCardLeft: { flex: 1, marginRight: 12 },
  impactCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  impactCardIcon: { width: 44, height: 44, backgroundColor: '#fef2f2', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  impactCardTitle: { flex: 1, color: '#1e293b', fontSize: 14, fontFamily: 'DMSans_600SemiBold' },
  impactCardDesc: { color: '#64748b', fontSize: 11, fontFamily: 'DMSans_400Regular', lineHeight: 18 },
  impactCardRight: { width: 88 },
  impactDonateBtn: { backgroundColor: '#dc2626', borderRadius: 20, paddingVertical: 7, alignItems: 'center', marginBottom: 8 },
  impactDonateBtnText: { color: 'white', fontSize: 10, fontFamily: 'DMSans_500Medium' },
  impactCardImage: { width: 88, height: 80, borderRadius: 12, resizeMode: 'cover' },
  doctorSection: { marginTop: 20, marginBottom: 20 },
  doctorImage: { width: '100%', height: 280, borderRadius: 24, resizeMode: 'cover' },
  doctorStatsRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  doctorStatCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  doctorStatValue: { color: '#1e293b', fontSize: 24, fontFamily: 'DMSans_700Bold', marginBottom: 4 },
  doctorStatLabel: { color: '#64748b', fontSize: 12, fontFamily: 'DMSans_400Regular' },
  visionCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  visionIcon: { width: 48, height: 48, backgroundColor: '#fef2f2', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  visionTitle: { color: '#1e293b', fontSize: 16, fontFamily: 'DMSans_600SemiBold', marginBottom: 8 },
  visionDesc: { color: '#64748b', fontSize: 13, fontFamily: 'DMSans_400Regular', lineHeight: 21 },

  // Blood Types - FIXED: Border on WHOLE card
  bloodTypesSection: { padding: 20, paddingTop: 40, paddingBottom: 40, backgroundColor: 'white' },
  sectionTag: { color: '#dc2626', fontSize: 13, fontFamily: 'DMSans_500Medium', letterSpacing: 1, textAlign: 'center', marginBottom: 12 },
  sectionTitle: { color: '#1e293b', fontSize: 28, fontFamily: 'PlayfairDisplay_400Regular', textAlign: 'center', marginBottom: 12 },
  sectionSubtitle: { color: '#64748b', fontSize: 15, fontFamily: 'DMSans_400Regular', textAlign: 'center', lineHeight: 24, marginBottom: 32, paddingHorizontal: 20 },
  bloodTypesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  bloodTypeCardWrapper: { width: '50%', paddingHorizontal: 8, marginBottom: 16 },
  bloodTypeCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  bloodTypeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  bloodTypeBadge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bloodTypeText: { color: 'white', fontSize: 18, fontFamily: 'DMSans_700Bold' },
  bloodTypePercent: { color: '#64748b', fontSize: 12, fontFamily: 'DMSans_500Medium' },
  bloodTypeInfo: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  bloodTypeInfoLabel: { color: '#94a3b8', fontSize: 9, fontFamily: 'DMSans_500Medium', letterSpacing: 0.5, marginBottom: 2 },
  bloodTypeInfoValue: { color: '#1e293b', fontSize: 12, fontFamily: 'DMSans_500Medium' },

  // How It Works
  howItWorksSection: { padding: 20, paddingTop: 40, paddingBottom: 40, backgroundColor: '#f8fafc' },
  stepCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: '#e2e8f0' },
  stepIconContainer: { marginRight: 16 },
  stepIcon: { width: 48, height: 48, backgroundColor: '#fef2f2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stepContent: { flex: 1 },
  stepTitle: { color: '#1e293b', fontSize: 16, fontFamily: 'DMSans_600SemiBold', marginBottom: 4 },
  stepDesc: { color: '#64748b', fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 22 },
  stepNumber: { color: '#e2e8f0', fontSize: 32, fontFamily: 'DMSans_700Bold' },

  // Stats Grid - With white cards, borders, shadows
  statsGridSection: { padding: 20, paddingTop: 32, paddingBottom: 32, backgroundColor: '#f8fafc' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  statsGridCardWrapper: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  statsGridCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statsGridIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statsGridValue: { color: '#1e293b', fontSize: 28, fontFamily: 'DMSans_700Bold', marginBottom: 2 },
  statsGridLabel: { color: '#64748b', fontSize: 13, fontFamily: 'DMSans_400Regular' },

  // Newsletter - Card with background image overlay
  newsletterWrapper: { backgroundColor: '#f8fafc', padding: 20, paddingTop: 0 },
  newsletterCard: { borderRadius: 24, overflow: 'hidden' },
  newsletterBg: { minHeight: 440 },
  newsletterBgImage: { borderRadius: 24 },
  newsletterContent: { flex: 1, padding: 28, paddingTop: 60, justifyContent: 'center' },
  newsletterTagContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  newsletterTagDot: { width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4 },
  newsletterTag: { color: '#dc2626', fontSize: 12, fontFamily: 'DMSans_600SemiBold', letterSpacing: 1, marginLeft: 8 },
  newsletterTitle: { color: 'white', fontSize: 28, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 28, lineHeight: 38 },
  newsletterInputWrapper: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, marginBottom: 16 },
  newsletterInput: { color: 'white', paddingHorizontal: 20, paddingVertical: 16, fontSize: 15, fontFamily: 'DMSans_400Regular' },
  subscribeBtn: { backgroundColor: 'white', borderRadius: 24, paddingVertical: 16, alignItems: 'center' },
  subscribeBtnText: { color: '#1e293b', fontSize: 15, fontFamily: 'DMSans_600SemiBold' },

  // Join Community - Rounded dark card with background image
  joinSectionWrapper: { backgroundColor: '#f8fafc', padding: 20, paddingTop: 32 },
  joinBgWrapper: { borderRadius: 24, overflow: 'hidden' },
  joinBgImage: { borderRadius: 24, opacity: 0.15 },
  joinGradient: { borderRadius: 24 },
  joinSection: { padding: 28, paddingTop: 32, paddingBottom: 32 },
  joinTag: { color: '#dc2626', fontSize: 12, fontFamily: 'DMSans_600SemiBold', letterSpacing: 1, marginBottom: 16 },
  joinTitle: { color: 'white', fontSize: 30, fontFamily: 'PlayfairDisplay_400Regular', lineHeight: 40, marginBottom: 16 },
  joinTitleHighlight: { color: '#dc2626', fontFamily: 'PlayfairDisplay_400Regular_Italic' },
  joinSubtitle: { color: '#94a3b8', fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 22, marginBottom: 24 },
  joinButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  joinBtnPrimary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dc2626', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8 },
  joinBtnPrimaryText: { color: 'white', fontSize: 14, fontFamily: 'DMSans_500Medium' },
  joinBtnSecondary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8 },
  joinBtnSecondaryText: { color: 'white', fontSize: 14, fontFamily: 'DMSans_500Medium' },
  joinStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  joinStatCardWrapper: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  joinStatCard: { backgroundColor: '#334155', borderRadius: 16, padding: 16 },
  joinStatValue: { color: 'white', fontSize: 26, fontFamily: 'DMSans_700Bold', marginBottom: 4 },
  joinStatLabel: { color: '#94a3b8', fontSize: 12, fontFamily: 'DMSans_400Regular' },

  // Footer
  footer: { backgroundColor: '#1e293b', padding: 24, paddingTop: 40 },
  footerTop: { marginBottom: 32 },
  footerLogoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  footerLogoIcon: { width: 40, height: 40, backgroundColor: '#dc2626', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  footerLogoText: { color: 'white', fontSize: 18, fontFamily: 'DMSans_600SemiBold', marginLeft: 12 },
  footerDesc: { color: '#94a3b8', fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 22, marginBottom: 20 },
  socialIcons: { flexDirection: 'row', gap: 12 },
  socialIcon: { width: 40, height: 40, backgroundColor: '#334155', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  footerLinks: { marginBottom: 32 },
  footerLinksTitle: { color: 'white', fontSize: 16, fontFamily: 'DMSans_600SemiBold', marginBottom: 16 },
  footerLink: { color: '#94a3b8', fontSize: 14, fontFamily: 'DMSans_400Regular', marginBottom: 12 },
  footerContact: { marginBottom: 32 },
  footerContactItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  footerContactText: { color: '#94a3b8', fontSize: 14, fontFamily: 'DMSans_400Regular', flex: 1 },
  footerBottom: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 24 },
  footerCopyright: { color: '#64748b', fontSize: 13, fontFamily: 'DMSans_400Regular', textAlign: 'center', marginBottom: 16 },
  footerPolicies: { flexDirection: 'row', justifyContent: 'center', gap: 16, flexWrap: 'wrap' },
  footerPolicy: { color: '#3b82f6', fontSize: 13, fontFamily: 'DMSans_400Regular' },
});
