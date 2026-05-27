import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  hi: {
    translation: {
      common: {
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        retry: 'पुनः प्रयास',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        confirm: 'पुष्टि करें',
        search: 'खोजें',
        noData: 'कोई डेटा नहीं',
      },
      dashboard: {
        title: 'डैशबोर्ड',
        todayOrders: 'आज के ऑर्डर',
        revenue: 'रेवेन्यू',
        activeDrivers: 'सक्रिय ड्राइवर',
        pendingOrders: 'लंबित ऑर्डर',
        recentOrders: 'हाल के ऑर्डर',
      },
      orders: {
        title: 'ऑर्डर',
        pending: 'लंबित',
        active: 'सक्रिय',
        completed: 'पूर्ण',
        cancelled: 'रद्द',
        createOrder: 'नया ऑर्डर',
        orderNumber: 'ऑर्डर संख्या',
        customer: 'ग्राहक',
        amount: 'राशि',
        status: 'स्थिति',
      },
      drivers: {
        title: 'ड्राइवर',
        addDriver: 'ड्राइवर जोड़ें',
        onDuty: 'ड्यूटी पर',
        offDuty: 'ड्यूटी से बाहर',
        vehicle: 'वाहन',
        phone: 'फोन',
      },
      inventory: {
        title: 'इन्वेंटरी',
        lowStock: 'कम स्टॉक',
        addItem: 'आइटम जोड़ें',
        stockStatus: 'स्टॉक स्थिति',
        reorder: 'पुनः ऑर्डर',
      },
    },
  },
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        search: 'Search',
        noData: 'No data',
      },
      dashboard: {
        title: 'Dashboard',
        todayOrders: "Today's Orders",
        revenue: 'Revenue',
        activeDrivers: 'Active Drivers',
        pendingOrders: 'Pending Orders',
        recentOrders: 'Recent Orders',
      },
      orders: {
        title: 'Orders',
        pending: 'Pending',
        active: 'Active',
        completed: 'Completed',
        cancelled: 'Cancelled',
        createOrder: 'Create Order',
        orderNumber: 'Order Number',
        customer: 'Customer',
        amount: 'Amount',
        status: 'Status',
      },
      drivers: {
        title: 'Drivers',
        addDriver: 'Add Driver',
        onDuty: 'On Duty',
        offDuty: 'Off Duty',
        vehicle: 'Vehicle',
        phone: 'Phone',
      },
      inventory: {
        title: 'Inventory',
        lowStock: 'Low Stock',
        addItem: 'Add Item',
        stockStatus: 'Stock Status',
        reorder: 'Reorder',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'hi',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
