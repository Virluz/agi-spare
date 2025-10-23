// components/FilterModal.js
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react-native';

const FilterModal = ({
    visible,
    onClose,
    filters,
    selectedFilters,
    onFilterChange,
    colorSet, apply
}) => {

    console.log("FilterModal ", filters);

    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (filterId) => {
        setExpandedSections(prev => ({
            ...prev,
            [filterId]: !prev[filterId]
        }));
    };

    const handleFilterSelect = (filterId, value) => {
        const currentValues = selectedFilters[filterId] || [];
        let newValues;

        if (currentValues.includes(value)) {
            newValues = currentValues.filter(v => v !== value);
        } else {
            newValues = [...currentValues, value];
        }

        onFilterChange(filterId, newValues);
    };

    const clearAllFilters = () => {
        Object.keys(selectedFilters).forEach(filterId => {
            onFilterChange(filterId, []);
        });
    };

    const applyFilters = () => {
        apply();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContent, { backgroundColor: colorSet.mainThemeBackgroundColor }]}>

                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: colorSet.mainTextColor }]}>
                                    Filters
                                </Text>
                                <View style={styles.headerActions}>
                                    <TouchableOpacity onPress={clearAllFilters}>
                                        <Text style={[styles.clearText, { color: colorSet.primaryColor }]}>
                                            Clear All
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onClose}>
                                        <X size={24} color={colorSet.mainTextColor} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Filter Sections */}
                            {/* <ScrollView style={styles.scrollView}> */}
                            {filters.map((filter) => (
                                <View key={filter.id} style={styles.filterSection}>
                                    <TouchableOpacity
                                        style={styles.sectionHeader}
                                        onPress={() => toggleSection(filter.id)}
                                    >
                                        <Text style={[styles.sectionTitle, { color: colorSet.mainTextColor }]}>
                                            {filter.label}
                                        </Text>
                                        {expandedSections[filter.id] ? (
                                            <ChevronUp size={20} color={colorSet.mainTextColor} />
                                        ) : (
                                            <ChevronDown size={20} color={colorSet.mainTextColor} />
                                        )}
                                    </TouchableOpacity>

                                    {expandedSections[filter.id] && (
                                        <View style={styles.optionsContainer}>
                                            {filter.values.map((value) => {
                                                const isSelected = selectedFilters[filter.id]?.includes(value.input);
                                                return (
                                                    <TouchableOpacity
                                                        key={value.id}
                                                        style={[
                                                            styles.option,
                                                            isSelected && { backgroundColor: colorSet.primaryColor + '20' }
                                                        ]}
                                                        onPress={() => handleFilterSelect(filter.id, value.input)}
                                                    >
                                                        <Text style={[
                                                            styles.optionText,
                                                            { color: colorSet.mainTextColor },
                                                            isSelected && { color: colorSet.primaryColor, fontWeight: '600' }
                                                        ]}>
                                                            {value.label}
                                                        </Text>
                                                        {isSelected && (
                                                            <Check size={16} color={colorSet.primaryColor} />
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            ))}
                            {/* </ScrollView> */}

                            {/* Apply Button */}
                            <TouchableOpacity
                                style={[styles.applyButton, { backgroundColor: colorSet.primaryColor }]}
                                onPress={applyFilters}
                            >
                                <Text style={styles.applyButtonText}>
                                    Apply Filters
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    clearText: {
        fontSize: 14,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
        marginBottom: 20,
    },
    filterSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    optionsContainer: {
        paddingTop: 8,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    optionText: {
        fontSize: 14,
        flex: 1,
    },
    applyButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FilterModal;