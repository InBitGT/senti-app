import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  menu: {
    paddingVertical: 8,
    gap: 2,
  },
  accordionContainer: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  itemChild: {
    paddingLeft: 12, 
  },
  itemActive: {
    backgroundColor: '#ede9fe',
  },
  itemPressed: {
    backgroundColor: '#f1f5f9',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  itemTextFlex: {
    flex: 1,
  },
  itemTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  childrenWrapper: {
    marginLeft: 28,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    marginBottom: 4,
  },
});