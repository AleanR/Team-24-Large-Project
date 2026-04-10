// lib/modules/events/presentation/screens/bet_slip_panel.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../domain/event.dart';
import '../controllers/event_detail_controller.dart';

class BettingSlipSheet extends StatefulWidget {
  final EventModel event;
  final String team; // "home" or "away"
  final double odds;
  final EventDetailController controller;

  /// The user's current KP balance. Used to enforce the 30% max stake cap.
  final double userBalance;

  const BettingSlipSheet({
    super.key,
    required this.event,
    required this.team,
    required this.odds,
    required this.controller,
    required this.userBalance,
  });

  static Future<void> show(
    BuildContext context, {
    required EventModel event,
    required String team,
    required double odds,
    required EventDetailController controller,
    double userBalance = 1000, // default fallback — wire up real balance
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BettingSlipSheet(
        event: event,
        team: team,
        odds: odds,
        controller: controller,
        userBalance: userBalance,
      ),
    );
  }

  @override
  State<BettingSlipSheet> createState() => _BettingSlipSheetState();
}

class _BettingSlipSheetState extends State<BettingSlipSheet> {
  double _stake = 0;

  String get _teamName =>
      widget.team == 'home' ? widget.event.homeTeam : widget.event.awayTeam;

  String get _matchupLabel {
    final opp = widget.team == 'home'
        ? widget.event.awayTeam
        : widget.event.homeTeam;
    final d = widget.event.bettingOpensAt;
    const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return 'vs $opp · ${months[d.month]} ${d.day}';
  }

  /// 30% of balance, floored to integer KP
  double get _maxStake => (widget.userBalance * 0.30).floorToDouble();

  double get _potentialPayout => _stake * widget.odds;

  bool get _overMax => _stake > _maxStake;

  void _addAmount(double amount) {
    setState(() {
      _stake = (_stake + amount).clamp(0, _maxStake);
    });
  }

  void _setMax() {
    HapticFeedback.selectionClick();
    setState(() => _stake = _maxStake);
  }

  void _adjust(int delta) {
    setState(() {
      _stake = (_stake + delta).clamp(0, _maxStake);
    });
  }

  Future<void> _placeBet() async {
    if (_stake <= 0) {
      _showSnack('Enter a stake amount', isError: true);
      return;
    }
    if (_overMax) {
      _showSnack('Max stake is ${_maxStake.toStringAsFixed(0)} KP (30% of balance)', isError: true);
      return;
    }

    HapticFeedback.mediumImpact();

    final success = await widget.controller.placeBet(
      event: widget.event,
      team: widget.team,
      stake: _stake,
      odds: widget.odds,
    );

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
      _showSnack('Bet placed! Potential payout: ${_potentialPayout.toStringAsFixed(0)} KP');
    } else {
      _showSnack(widget.controller.errorMessage ?? 'Bet failed', isError: true);
      widget.controller.reset();
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg,
          style: GoogleFonts.dmSans(color: Colors.white, fontWeight: FontWeight.w600)),
      backgroundColor: isError ? const Color(0xFFEF4444) : const Color(0xFF22C55E),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      duration: const Duration(seconds: 3),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).viewInsets.bottom +
        MediaQuery.of(context).padding.bottom;

    return ListenableBuilder(
      listenable: widget.controller,
      builder: (context, _) {
        final isLoading = widget.controller.betState == BetState.loading;

        return Container(
          padding: EdgeInsets.fromLTRB(20, 8, 20, 20 + bottomPad),
          decoration: const BoxDecoration(
            color: Color(0xFF0E1014),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border: Border(top: BorderSide(color: Color(0xFF1E2028), width: 1)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 20),
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2D35),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // YOUR PICK label
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'YOUR PICK',
                  style: GoogleFonts.dmSans(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF6B7280),
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Team name + odds badge row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _teamName,
                          style: GoogleFonts.dmSans(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _matchupLabel,
                          style: GoogleFonts.dmSans(
                            fontSize: 12,
                            color: const Color(0xFF6B7280),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Odds badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C1A10),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.3), width: 1),
                    ),
                    child: Column(
                      children: [
                        Text(
                          'ODDS',
                          style: GoogleFonts.dmSans(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF6B7280),
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.odds.toStringAsFixed(2),
                          style: GoogleFonts.dmSans(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFFFBBF24),
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              Container(height: 1, color: const Color(0xFF1E2028)),
              const SizedBox(height: 20),

              // STAKE label
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'STAKE',
                  style: GoogleFonts.dmSans(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF6B7280),
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Stake amount row with – amount +
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _CircleButton(
                    icon: Icons.remove,
                    onTap: isLoading ? null : () => _adjust(-50),
                  ),
                  const SizedBox(width: 20),
                  Text(
                    _stake.toStringAsFixed(0),
                    style: GoogleFonts.dmSans(
                      fontSize: 48,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: -2,
                    ),
                  ),
                  const SizedBox(width: 20),
                  _CircleButton(
                    icon: Icons.add,
                    onTap: isLoading ? null : () => _adjust(50),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              // 30% cap warning
              Text(
                _overMax
                    ? 'Max stake is 30% of balance'
                    : 'Max stake is 30% of balance · ${_maxStake.toStringAsFixed(0)} KP',
                style: GoogleFonts.dmSans(
                  fontSize: 11,
                  color: _overMax ? const Color(0xFFEF4444) : const Color(0xFF4B5563),
                ),
              ),
              const SizedBox(height: 16),

              // Preset quick-add buttons
              Row(
                children: [
                  _PresetButton(label: '+50', onTap: isLoading ? null : () => _addAmount(50)),
                  const SizedBox(width: 8),
                  _PresetButton(label: '+100', onTap: isLoading ? null : () => _addAmount(100)),
                  const SizedBox(width: 8),
                  _PresetButton(label: '+200', onTap: isLoading ? null : () => _addAmount(200)),
                  const SizedBox(width: 8),
                  _PresetButton(
                    label: 'Max',
                    isMax: true,
                    onTap: isLoading ? null : _setMax,
                  ),
                ],
              ),

              const SizedBox(height: 24),
              Container(height: 1, color: const Color(0xFF1E2028)),
              const SizedBox(height: 16),

              // Payout + balance row
              Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('POTENTIAL PAYOUT',
                          style: GoogleFonts.dmSans(
                              fontSize: 10, fontWeight: FontWeight.w700,
                              color: const Color(0xFF6B7280), letterSpacing: 0.8)),
                      const SizedBox(height: 4),
                      Text(
                        '${_potentialPayout.toStringAsFixed(0)} KP',
                        style: GoogleFonts.dmSans(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF22C55E),
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('BALANCE',
                          style: GoogleFonts.dmSans(
                              fontSize: 10, fontWeight: FontWeight.w700,
                              color: const Color(0xFF6B7280), letterSpacing: 0.8)),
                      const SizedBox(height: 4),
                      Text(
                        '${widget.userBalance.toStringAsFixed(0)} KP',
                        style: GoogleFonts.dmSans(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF9CA3AF),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Place Bet button
              GestureDetector(
                onTap: isLoading || _stake <= 0 || _overMax ? null : _placeBet,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  width: double.infinity,
                  height: 56,
                  decoration: BoxDecoration(
                    color: (_stake <= 0 || _overMax || isLoading)
                        ? const Color(0xFF1E2028)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  alignment: Alignment.center,
                  child: isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                              strokeWidth: 2.5, color: Colors.black),
                        )
                      : Text(
                          _stake > 0
                              ? 'Place Bet · ${_stake.toStringAsFixed(0)} KP'
                              : 'Place Bet',
                          style: GoogleFonts.dmSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: (_stake <= 0 || _overMax)
                                ? const Color(0xFF4B5563)
                                : Colors.black,
                            letterSpacing: -0.3,
                          ),
                        ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Helper widgets ────────────────────────────────────────────────────────────

class _CircleButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  const _CircleButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: const Color(0xFF1C1F26),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFF2A2D35), width: 1),
        ),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    );
  }
}

class _PresetButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool isMax;
  const _PresetButton({required this.label, this.onTap, this.isMax = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 38,
          decoration: BoxDecoration(
            color: isMax
                ? const Color(0xFF1C1A10)
                : const Color(0xFF1C1F26),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isMax
                  ? const Color(0xFFFBBF24).withValues(alpha: 0.4)
                  : const Color(0xFF2A2D35),
              width: 1,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: GoogleFonts.dmSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: isMax ? const Color(0xFFFBBF24) : const Color(0xFF9CA3AF),
            ),
          ),
        ),
      ),
    );
  }
}
