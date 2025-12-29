import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/order.dart';
import '../../../domain/providers/user_provider.dart';
import '../../../shared/widgets/demo_banner.dart';

class AddressFormScreen extends ConsumerStatefulWidget {
  final String? addressId;

  const AddressFormScreen({super.key, this.addressId});

  @override
  ConsumerState<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends ConsumerState<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _labelController = TextEditingController();
  final _line1Controller = TextEditingController();
  final _line2Controller = TextEditingController();
  final _cityController = TextEditingController();
  final _postcodeController = TextEditingController();
  final _instructionsController = TextEditingController();
  bool _isDefault = false;
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    if (widget.addressId != null) {
      _isEditing = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final addresses = ref.read(addressesProvider);
        DeliveryAddress? foundAddress;
        for (final a in addresses) {
          if (a.id == widget.addressId) {
            foundAddress = a;
            break;
          }
        }
        if (foundAddress != null) {
          _labelController.text = foundAddress.label;
          _line1Controller.text = foundAddress.addressLine1;
          _line2Controller.text = foundAddress.addressLine2 ?? '';
          _cityController.text = foundAddress.city;
          _postcodeController.text = foundAddress.postcode;
          _instructionsController.text =
              foundAddress.deliveryInstructions ?? '';
          _isDefault = foundAddress.isDefault;
          setState(() {});
        }
      });
    } else {
      _cityController.text = 'London';
    }
  }

  @override
  void dispose() {
    _labelController.dispose();
    _line1Controller.dispose();
    _line2Controller.dispose();
    _cityController.dispose();
    _postcodeController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Address' : 'Add Address'),
      ),
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Label chips
                  Text('Address Type', style: AppTheme.labelLarge),
                  const SizedBox(height: 12),
                  Row(
                    children: ['Home', 'Work', 'Other'].map((label) {
                      final isSelected = _labelController.text == label;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(label),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _labelController.text = label);
                            }
                          },
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 20),

                  TextFormField(
                    controller: _line1Controller,
                    decoration: const InputDecoration(
                      labelText: 'Address Line 1',
                      hintText: 'Street address',
                      prefixIcon: Icon(Icons.location_on_outlined),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the address';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _line2Controller,
                    decoration: const InputDecoration(
                      labelText: 'Address Line 2 (Optional)',
                      hintText: 'Flat, suite, building, floor',
                      prefixIcon: Icon(Icons.apartment),
                    ),
                  ),

                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TextFormField(
                          controller: _cityController,
                          decoration: const InputDecoration(
                            labelText: 'City',
                            prefixIcon: Icon(Icons.location_city),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Required';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        flex: 1,
                        child: TextFormField(
                          controller: _postcodeController,
                          decoration: const InputDecoration(
                            labelText: 'Postcode',
                          ),
                          textCapitalization: TextCapitalization.characters,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Required';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _instructionsController,
                    decoration: const InputDecoration(
                      labelText: 'Delivery Instructions (Optional)',
                      hintText: 'Gate code, buzzer number, landmarks...',
                      prefixIcon: Icon(Icons.note_outlined),
                    ),
                    maxLines: 2,
                  ),

                  const SizedBox(height: 16),

                  CheckboxListTile(
                    title: const Text('Set as default address'),
                    value: _isDefault,
                    onChanged: (value) {
                      setState(() => _isDefault = value ?? false);
                    },
                    controlAffinity: ListTileControlAffinity.leading,
                    contentPadding: EdgeInsets.zero,
                  ),

                  const SizedBox(height: 24),

                  ElevatedButton(
                    onPressed: _saveAddress,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52),
                    ),
                    child: Text(_isEditing ? 'Update Address' : 'Save Address'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _saveAddress() {
    if (!_formKey.currentState!.validate()) return;

    if (_labelController.text.isEmpty) {
      _labelController.text = 'Home';
    }

    final address = DeliveryAddress(
      id: widget.addressId ?? const Uuid().v4(),
      label: _labelController.text,
      addressLine1: _line1Controller.text,
      addressLine2: _line2Controller.text,
      city: _cityController.text,
      postcode: _postcodeController.text,
      deliveryInstructions: _instructionsController.text,
      isDefault: _isDefault,
    );

    if (_isEditing) {
      ref.read(userProvider.notifier).updateAddress(address);
    } else {
      ref.read(userProvider.notifier).addAddress(address);
    }

    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isEditing ? 'Address updated' : 'Address saved'),
        backgroundColor: AppColors.success,
      ),
    );
  }
}
