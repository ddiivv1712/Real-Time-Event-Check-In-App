import React from 'react';
import { ScrollView, View, RefreshControl, RefreshControlProps } from 'react-native';

interface SafeFlatListProps<ItemT> {
  data: ItemT[] | null | undefined;
  renderItem: ({ item, index }: { item: ItemT; index: number }) => React.ReactElement | null;
  keyExtractor?: (item: ItemT, index: number) => string;
  contentContainerStyle?: any;
  style?: any;
  showsVerticalScrollIndicator?: boolean;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  removeClippedSubviews?: boolean;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
}

// Custom FlatList replacement using ScrollView
function SafeFlatList<ItemT = any>(props: SafeFlatListProps<ItemT>) {
  const {
    data,
    renderItem,
    keyExtractor,
    contentContainerStyle,
    style,
    showsVerticalScrollIndicator = true,
    ListEmptyComponent,
    refreshControl,
    ...restProps
  } = props;
  
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  
  // Log for debugging
  console.log('SafeFlatList: Rendering with data length:', safeData.length);
  console.log('SafeFlatList: First item:', safeData[0]);
  
  // Use provided keyExtractor or create a safe default
  const safeKeyExtractor = keyExtractor || ((item: any, index: number) => {
    if (item && typeof item === 'object' && 'id' in item) {
      return String(item.id);
    }
    return `item-${index}`;
  });
  
  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={refreshControl}
      {...restProps}
    >
      {safeData.length === 0 && ListEmptyComponent ? (
        React.isValidElement(ListEmptyComponent) ? (
          ListEmptyComponent
        ) : typeof ListEmptyComponent === 'function' ? (
          React.createElement(ListEmptyComponent)
        ) : null
      ) : (
        safeData.map((item, index) => {
          const key = safeKeyExtractor(item, index);
          return (
            <View key={key}>
              {renderItem({ item, index })}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

export default SafeFlatList;