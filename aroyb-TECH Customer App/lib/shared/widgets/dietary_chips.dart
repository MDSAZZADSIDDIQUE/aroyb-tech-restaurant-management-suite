import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';

/// Dietary tag chip widget
class DietaryChip extends StatelessWidget {
  final String tag;
  final bool compact;

  const DietaryChip({
    super.key,
    required this.tag,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final dietaryTag = _getDietaryTag(tag);
    if (dietaryTag == null) return const SizedBox.shrink();

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 4 : 8,
        vertical: compact ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: Color(dietaryTag.colorValue).withOpacity(0.15),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: Color(dietaryTag.colorValue).withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        compact ? dietaryTag.shortLabel : dietaryTag.label,
        style: TextStyle(
          color: Color(dietaryTag.colorValue),
          fontSize: compact ? 10 : 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  DietaryTag? _getDietaryTag(String tag) {
    try {
      return DietaryTag.values.firstWhere(
        (t) => t.name.toLowerCase() == tag.toLowerCase(),
      );
    } catch (_) {
      return null;
    }
  }
}

/// Row of dietary chips
class DietaryChipsRow extends StatelessWidget {
  final List<String> tags;
  final bool compact;
  final int maxChips;

  const DietaryChipsRow({
    super.key,
    required this.tags,
    this.compact = false,
    this.maxChips = 3,
  });

  @override
  Widget build(BuildContext context) {
    final displayTags = tags.take(maxChips).toList();
    final remaining = tags.length - maxChips;

    return Wrap(
      spacing: 4,
      runSpacing: 4,
      children: [
        ...displayTags.map((tag) => DietaryChip(tag: tag, compact: compact)),
        if (remaining > 0)
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: compact ? 4 : 6,
              vertical: compact ? 2 : 4,
            ),
            decoration: BoxDecoration(
              color: AppColors.textTertiary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              '+$remaining',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: compact ? 10 : 11,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }
}

/// Spice level indicator
class SpiceLevelIndicator extends StatelessWidget {
  final int level;
  final bool showLabel;
  final double size;

  const SpiceLevelIndicator({
    super.key,
    required this.level,
    this.showLabel = false,
    this.size = 16,
  });

  @override
  Widget build(BuildContext context) {
    if (level <= 0) return const SizedBox.shrink();

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(level, (index) {
            return Padding(
              padding: const EdgeInsets.only(right: 1),
              child: Text(
                '🌶️',
                style: TextStyle(fontSize: size - 2),
              ),
            );
          }),
        ),
        if (showLabel) ...[
          const SizedBox(width: 4),
          Text(
            _getSpiceLabel(level),
            style: TextStyle(
              color: AppColors.spicy,
              fontSize: size - 4,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }

  String _getSpiceLabel(int level) {
    switch (level) {
      case 1:
        return 'Mild';
      case 2:
        return 'Medium';
      case 3:
        return 'Hot';
      case 4:
        return 'Extra Hot';
      default:
        return '';
    }
  }
}

/// Allergen warning chip
class AllergenChip extends StatelessWidget {
  final String allergen;

  const AllergenChip({super.key, required this.allergen});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.warning.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: AppColors.warning.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.warning_amber_rounded,
            size: 12,
            color: AppColors.warning,
          ),
          const SizedBox(width: 4),
          Text(
            allergen,
            style: const TextStyle(
              color: AppColors.warning,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
