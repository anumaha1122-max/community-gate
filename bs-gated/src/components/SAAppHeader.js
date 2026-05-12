

// import React from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import COLORS from '../theme/SAcolors';
// import SPACING from '../theme/spacing';
// import { useAppContext } from '../screens/superadmin/SocietyContext';

// export default function AppHeader({
//   title,
//   subtitle,
//   showBack = false,
//   onBack,
// }) {
//   const { whiteLabelConfig } = useAppContext();

//   return (
//     <View style={styles.container}>
//       <View style={styles.leftRow}>
//         {showBack ? (
//           <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
//             <Ionicons name="chevron-back" size={22} color={COLORS.text} />
//           </TouchableOpacity>
//         ) : whiteLabelConfig?.logo ? (
//           <View style={styles.logoWrap}>
//             <Image source={{ uri: whiteLabelConfig.logo }} style={styles.logoImage} />
//           </View>
//         ) : (
//           <View style={styles.avatar}>
//             <Ionicons name="person-circle" size={40} color={COLORS.goldDark} />
//           </View>
//         )}

//         <View>
//           <Text style={styles.title}>{title}</Text>
//           {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.lg,
//     paddingBottom: SPACING.md,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   leftRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatar: {
//     marginRight: 12,
//   },
//   logoWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     overflow: 'hidden',
//   },
//   logoImage: {
//     width: 34,
//     height: 34,
//     resizeMode: 'contain',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: COLORS.subText,
//     marginTop: 2,
//   },
// });    

























// import React from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import COLORS from '../theme/SAcolors';
// import SPACING from '../theme/spacing';
// import { useAppContext } from '../screens/superadmin/SocietyContext';

// export default function AppHeader({
//   title,
//   subtitle,
//   showBack = false,
//   onBack,

//   showNotification = false,
//   notificationCount = 0,
//   onNotificationPress,
// }) {
//   const { whiteLabelConfig } = useAppContext();

//   const count = Number(notificationCount) || 0;

//   return (
//     <View style={styles.container}>
//       <View style={styles.leftRow}>
//         {showBack ? (
//           <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.8}>
//             <Ionicons name="chevron-back" size={22} color={COLORS.text} />
//           </TouchableOpacity>
//         ) : whiteLabelConfig?.logo ? (
//           <View style={styles.logoWrap}>
//             <Image source={{ uri: whiteLabelConfig.logo }} style={styles.logoImage} />
//           </View>
//         ) : (
//           <View style={styles.avatar}>
//             <Ionicons name="person-circle" size={40} color={COLORS.goldDark} />
//           </View>
//         )}

//         <View style={styles.titleWrap}>
//           <Text numberOfLines={1} style={styles.title}>{title}</Text>
//           {!!subtitle && (
//             <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
//           )}
//         </View>
//       </View>

//       {showNotification && (
//         <TouchableOpacity
//           style={styles.notificationBtn}
//           onPress={onNotificationPress}
//           activeOpacity={0.8}
//         >
//           <Ionicons
//             name={count > 0 ? 'notifications' : 'notifications-outline'}
//             size={22}
//             color={COLORS.text}
//           />

//           {count > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>
//                 {count > 99 ? '99+' : count}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.lg,
//     paddingBottom: SPACING.md,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 25,
//   },
//   leftRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   titleWrap: {
//     flex: 1,
//   },
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatar: {
//     marginRight: 12,
//   },
//   logoWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     overflow: 'hidden',
//   },
//   logoImage: {
//     width: 34,
//     height: 34,
//     resizeMode: 'contain',
//   },
//   notificationBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 12,
//   },
//   badge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     minWidth: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: '#EF4444',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     borderWidth: 1,
//     borderColor: COLORS.white,
//   },
//   badgeText: {
//     fontSize: 10,
//     fontWeight: '900',
//     color: COLORS.white,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: COLORS.subText,
//     marginTop: 2,
//   },
// });  






























import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/SAcolors';
import SPACING from '../theme/spacing';
import { useAppContext } from '../screens/superadmin/SocietyContext';

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showNotification = false,
  onNotificationPress,
}) {
  const { whiteLabelConfig } = useAppContext();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        ) : whiteLabelConfig?.logo ? (
          <View style={styles.logoWrap}>
            <Image
              source={{ uri: whiteLabelConfig.logo }}
              style={styles.logoImage}
            />
          </View>
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={40} color={COLORS.goldDark} />
          </View>
        )}

        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>

          {!!subtitle && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {showNotification && (
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={onNotificationPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleWrap: {
    flex: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    marginRight: 12,
  },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 2,
  },
});
