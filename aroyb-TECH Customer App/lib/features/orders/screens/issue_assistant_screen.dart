import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../domain/providers/order_provider.dart';
import '../../../data/repositories/order_repository.dart';
import '../../../shared/widgets/demo_banner.dart';

class IssueAssistantScreen extends ConsumerStatefulWidget {
  final String orderId;

  const IssueAssistantScreen({super.key, required this.orderId});

  @override
  ConsumerState<IssueAssistantScreen> createState() =>
      _IssueAssistantScreenState();
}

class _IssueAssistantScreenState extends ConsumerState<IssueAssistantScreen> {
  int _currentStep = 0;
  String? _selectedIssueType;
  final Set<String> _selectedItems = {};
  final _descriptionController = TextEditingController();
  String? _selectedResolution;
  bool _isSubmitting = false;

  final _issueTypes = [
    {
      'id': 'missing_items',
      'label': 'Missing items',
      'icon': Icons.remove_shopping_cart
    },
    {
      'id': 'wrong_items',
      'label': 'Wrong items received',
      'icon': Icons.swap_horiz
    },
    {
      'id': 'quality',
      'label': 'Food quality issue',
      'icon': Icons.sentiment_dissatisfied
    },
    {'id': 'late', 'label': 'Order arrived late', 'icon': Icons.schedule},
    {'id': 'damaged', 'label': 'Damaged packaging', 'icon': Icons.broken_image},
    {'id': 'other', 'label': 'Other issue', 'icon': Icons.help_outline},
  ];

  final _resolutions = [
    {'id': 'refund', 'label': 'Full refund', 'icon': Icons.money_off},
    {'id': 'partial_refund', 'label': 'Partial refund', 'icon': Icons.percent},
    {'id': 'credit', 'label': 'Store credit', 'icon': Icons.card_giftcard},
    {'id': 'replacement', 'label': 'Replace items', 'icon': Icons.refresh},
  ];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final order = ref.watch(activeOrderProvider);
    final orderRepo = ref.watch(orderRepositoryProvider);
    final displayOrder = order ?? orderRepo.getOrderById(widget.orderId);

    if (displayOrder == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Report Issue')),
        body: const Center(child: Text('Order not found')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Report an Issue'),
      ),
      body: Column(
        children: [
          const DemoBanner(),
          Expanded(
            child: Stepper(
              currentStep: _currentStep,
              onStepContinue: _canContinue() ? _nextStep : null,
              onStepCancel: _currentStep > 0
                  ? () => setState(() => _currentStep--)
                  : null,
              controlsBuilder: (context, details) {
                return Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed:
                            _canContinue() ? details.onStepContinue : null,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(_currentStep == 3 ? 'Submit' : 'Continue'),
                      ),
                      if (_currentStep > 0) ...[
                        const SizedBox(width: 12),
                        TextButton(
                          onPressed: details.onStepCancel,
                          child: const Text('Back'),
                        ),
                      ],
                    ],
                  ),
                );
              },
              steps: [
                // Step 1: Issue Type
                Step(
                  title: const Text('What happened?'),
                  subtitle: _selectedIssueType != null
                      ? Text(_issueTypes.firstWhere(
                              (t) => t['id'] == _selectedIssueType)['label']
                          as String)
                      : null,
                  isActive: _currentStep >= 0,
                  state:
                      _currentStep > 0 ? StepState.complete : StepState.indexed,
                  content: Column(
                    children: [
                      const Text(
                        'Our AI assistant will help resolve your issue quickly.',
                        style: TextStyle(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      ...List.generate(_issueTypes.length, (index) {
                        final type = _issueTypes[index];
                        final isSelected = _selectedIssueType == type['id'];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: _SelectableCard(
                            icon: type['icon'] as IconData,
                            label: type['label'] as String,
                            isSelected: isSelected,
                            onTap: () => setState(() =>
                                _selectedIssueType = type['id'] as String),
                          ),
                        );
                      }),
                    ],
                  ),
                ),

                // Step 2: Affected Items
                Step(
                  title: const Text('Which items were affected?'),
                  subtitle: _selectedItems.isNotEmpty
                      ? Text('${_selectedItems.length} item(s) selected')
                      : null,
                  isActive: _currentStep >= 1,
                  state:
                      _currentStep > 1 ? StepState.complete : StepState.indexed,
                  content: Column(
                    children: [
                      ...displayOrder.items.map((item) {
                        final isSelected =
                            _selectedItems.contains(item.menuItem.id);
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: _SelectableCard(
                            label: '${item.quantity}x ${item.menuItem.name}',
                            isSelected: isSelected,
                            onTap: () {
                              setState(() {
                                if (isSelected) {
                                  _selectedItems.remove(item.menuItem.id);
                                } else {
                                  _selectedItems.add(item.menuItem.id);
                                }
                              });
                            },
                          ),
                        );
                      }),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            if (_selectedItems.length ==
                                displayOrder.items.length) {
                              _selectedItems.clear();
                            } else {
                              _selectedItems.addAll(
                                  displayOrder.items.map((i) => i.menuItem.id));
                            }
                          });
                        },
                        child: Text(
                          _selectedItems.length == displayOrder.items.length
                              ? 'Deselect all'
                              : 'Select all items',
                        ),
                      ),
                    ],
                  ),
                ),

                // Step 3: Description
                Step(
                  title: const Text('Tell us more'),
                  isActive: _currentStep >= 2,
                  state:
                      _currentStep > 2 ? StepState.complete : StepState.indexed,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: _descriptionController,
                        maxLines: 4,
                        decoration: const InputDecoration(
                          hintText: 'Please describe the issue in detail...',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'Demo: Would open camera to add photo')),
                          );
                        },
                        icon: const Icon(Icons.camera_alt_outlined),
                        label: const Text('Add Photo (Optional)'),
                      ),
                    ],
                  ),
                ),

                // Step 4: Resolution
                Step(
                  title: const Text('How can we make it right?'),
                  isActive: _currentStep >= 3,
                  state: StepState.indexed,
                  content: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.infoLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.auto_awesome,
                                color: AppColors.info, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'AI Recommendation: Based on your issue, we suggest a ${_getAIRecommendation()}.',
                                style: AppTheme.bodySmall
                                    .copyWith(color: AppColors.info),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...List.generate(_resolutions.length, (index) {
                        final res = _resolutions[index];
                        final isSelected = _selectedResolution == res['id'];
                        final isRecommended = (res['id'] == 'refund' &&
                                _selectedIssueType == 'missing_items') ||
                            (res['id'] == 'partial_refund' &&
                                _selectedIssueType == 'quality') ||
                            (res['id'] == 'credit' &&
                                _selectedIssueType == 'late');
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: _SelectableCard(
                            icon: res['icon'] as IconData,
                            label: res['label'] as String,
                            isSelected: isSelected,
                            isRecommended: isRecommended,
                            onTap: () => setState(() =>
                                _selectedResolution = res['id'] as String),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getAIRecommendation() {
    switch (_selectedIssueType) {
      case 'missing_items':
        return 'full refund for missing items';
      case 'quality':
        return 'partial refund';
      case 'late':
        return 'store credit for future orders';
      default:
        return 'resolution based on your feedback';
    }
  }

  bool _canContinue() {
    switch (_currentStep) {
      case 0:
        return _selectedIssueType != null;
      case 1:
        return _selectedItems.isNotEmpty;
      case 2:
        return true; // Description is optional
      case 3:
        return _selectedResolution != null && !_isSubmitting;
      default:
        return false;
    }
  }

  void _nextStep() {
    if (_currentStep < 3) {
      setState(() => _currentStep++);
    } else {
      _submitIssue();
    }
  }

  Future<void> _submitIssue() async {
    setState(() => _isSubmitting = true);

    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isSubmitting = false);

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: AppColors.success),
              SizedBox(width: 8),
              Text('Issue Submitted'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Thank you for letting us know.'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.successLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Demo: In a real app, your issue would be reviewed and resolved within 24 hours. You\'d receive updates via push notification.',
                  style: TextStyle(fontSize: 13),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('Done'),
            ),
          ],
        ),
      );
    }
  }
}

class _SelectableCard extends StatelessWidget {
  final IconData? icon;
  final String label;
  final bool isSelected;
  final bool isRecommended;
  final VoidCallback onTap;

  const _SelectableCard({
    this.icon,
    required this.label,
    required this.isSelected,
    this.isRecommended = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withOpacity(0.1)
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              const SizedBox(width: 16),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTheme.bodyMedium.copyWith(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.textPrimary,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                  if (isRecommended)
                    Text(
                      'Recommended',
                      style: AppTheme.labelSmall.copyWith(
                        color: AppColors.secondary,
                      ),
                    ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
