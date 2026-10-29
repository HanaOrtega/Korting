import { Component } from 'react';
import { ScrollView, Text, View } from 'react-native';

/** Ostatnia siatka bezpieczeństwa: błąd w renderowaniu pokazuje komunikat zamiast zamykać aplikację. */
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 }}>Kortinglijst</Text>
          <Text selectable style={{ color: '#b00020' }}>{String(this.state.error?.stack || this.state.error)}</Text>
        </ScrollView>
      </View>
    );
  }
}
