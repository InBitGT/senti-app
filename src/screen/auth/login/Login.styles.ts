import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flexGrow: 1,           // ✅ flexGrow en lugar de flex: 1
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,   // ✅ padding vertical para que no quede pegado
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748b',
  },
  form: {
    marginTop: 20,
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 10,
  },
  errorText: {
  height: 18,         
  fontSize: 12,
  color: '#ef4444',
  marginTop: 2,
},
})