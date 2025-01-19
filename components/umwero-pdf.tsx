import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register the Umwero font
Font.register({
  family: 'UMWEROalpha',
  src: '/UMWEROPUAnumbers.otf',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontFamily: 'UMWEROalpha',
    fontSize: 12,
  },
});

interface UmweroPDFProps {
  translatedText: string;
  fontSize: number;
}

export const UmweroPDF: React.FC<UmweroPDFProps> = ({ translatedText, fontSize }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={[styles.text, { fontSize }]}>{translatedText}</Text>
      </View>
    </Page>
  </Document>
);

