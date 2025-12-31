// AI Printer Troubleshooter - Decision tree for common printer issues

import type { DiagnosisResult } from '@/types';

// Symptom definitions
export type Symptom = 
  | 'printer_offline'
  | 'blank_prints'
  | 'garbled_text'
  | 'paper_jam'
  | 'cuts_not_working'
  | 'slow_printing'
  | 'faded_prints';

export interface Question {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

export interface DiagnosisPath {
  questions: Question[];
  diagnose: (answers: Record<string, string>) => DiagnosisResult;
}

// Question bank
const questions: Record<string, Question> = {
  power_light: {
    id: 'power_light',
    text: 'Is the power light on the printer illuminated?',
    options: [
      { value: 'yes', label: 'Yes - light is on' },
      { value: 'no', label: 'No - no lights' },
      { value: 'blinking', label: 'Blinking/flashing' },
    ],
  },
  network_cable: {
    id: 'network_cable',
    text: 'Is the network cable securely connected?',
    options: [
      { value: 'yes', label: 'Yes - connected' },
      { value: 'no', label: 'No - loose/disconnected' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  paper_loaded: {
    id: 'paper_loaded',
    text: 'Is paper loaded in the printer?',
    options: [
      { value: 'yes', label: 'Yes - paper present' },
      { value: 'no', label: 'No - empty' },
      { value: 'low', label: 'Paper is low' },
    ],
  },
  paper_type: {
    id: 'paper_type',
    text: 'What type of paper are you using?',
    options: [
      { value: 'thermal', label: 'Thermal receipt paper' },
      { value: 'regular', label: 'Regular paper' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  recent_changes: {
    id: 'recent_changes',
    text: 'Were there any recent changes (software updates, new cables, etc.)?',
    options: [
      { value: 'yes', label: 'Yes - some changes made' },
      { value: 'no', label: 'No - nothing changed' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  cutter_sound: {
    id: 'cutter_sound',
    text: 'Do you hear the cutter mechanism activating?',
    options: [
      { value: 'yes', label: 'Yes - I hear it' },
      { value: 'no', label: 'No - no sound' },
      { value: 'grinding', label: 'Grinding/stuck sound' },
    ],
  },
  test_print: {
    id: 'test_print',
    text: 'Does the self-test print work (hold feed button on power-on)?',
    options: [
      { value: 'yes', label: 'Yes - test prints fine' },
      { value: 'no', label: 'No - test also fails' },
      { value: 'not_tried', label: 'Haven\'t tried' },
    ],
  },
  print_head_temp: {
    id: 'print_head_temp',
    text: 'Is the printer hot to the touch?',
    options: [
      { value: 'hot', label: 'Yes - very hot' },
      { value: 'warm', label: 'Warm - normal' },
      { value: 'cold', label: 'Cold' },
    ],
  },
};

// Diagnosis paths for each symptom
const diagnosisPaths: Record<Symptom, DiagnosisPath> = {
  printer_offline: {
    questions: [questions.power_light, questions.network_cable, questions.recent_changes],
    diagnose: (answers) => {
      const causes: { cause: string; likelihood: number }[] = [];
      
      if (answers.power_light === 'no') {
        causes.push({ cause: 'Power supply issue', likelihood: 90 });
        causes.push({ cause: 'Blown fuse', likelihood: 40 });
      } else if (answers.power_light === 'blinking') {
        causes.push({ cause: 'Error state - check error codes', likelihood: 80 });
      }
      
      if (answers.network_cable === 'no' || answers.network_cable === 'unsure') {
        causes.push({ cause: 'Network disconnection', likelihood: 85 });
      }
      
      if (answers.recent_changes === 'yes') {
        causes.push({ cause: 'Configuration change conflict', likelihood: 60 });
      }
      
      if (causes.length === 0) {
        causes.push({ cause: 'IP address conflict', likelihood: 50 });
        causes.push({ cause: 'Driver issue', likelihood: 40 });
      }
      
      return {
        causes: causes.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3),
        steps: [
          '1. Check power cable is securely connected',
          '2. Verify network cable connection at both ends',
          '3. Restart the printer (power off, wait 10 seconds, power on)',
          '4. Check printer IP on the device screen or print a config page',
          '5. Ping the printer IP from Print Bridge to verify connectivity',
        ],
        escalation: 'If issue persists after all steps, contact IT support for network configuration review.',
        confidence: Math.max(...causes.map(c => c.likelihood)) / 100,
        reasoning: 'Based on power indicator status and network connection state, the most likely cause has been identified.',
      };
    },
  },
  
  blank_prints: {
    questions: [questions.paper_type, questions.paper_loaded, questions.test_print],
    diagnose: (answers) => {
      const causes: { cause: string; likelihood: number }[] = [];
      
      if (answers.paper_type === 'regular') {
        causes.push({ cause: 'Wrong paper type - thermal paper required', likelihood: 95 });
      }
      
      if (answers.paper_loaded === 'no' || answers.paper_loaded === 'low') {
        causes.push({ cause: 'Paper not loaded correctly', likelihood: 80 });
      }
      
      if (answers.test_print === 'no') {
        causes.push({ cause: 'Print head failure', likelihood: 70 });
      }
      
      // Check paper orientation
      causes.push({ cause: 'Paper loaded wrong side up', likelihood: 60 });
      
      return {
        causes: causes.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3),
        steps: [
          '1. Verify you are using THERMAL receipt paper (shiny side)',
          '2. Reload paper with thermal side facing the print head',
          '3. Run a self-test print (hold feed button during power-on)',
          '4. Check print head for debris and clean gently if needed',
          '5. Try a new roll of thermal paper',
        ],
        escalation: 'If blank prints continue with correct paper, the print head may need replacement.',
        confidence: Math.max(...causes.map(c => c.likelihood)) / 100,
        reasoning: 'Thermal printers require special paper. Regular paper will result in blank prints.',
      };
    },
  },
  
  garbled_text: {
    questions: [questions.recent_changes, questions.test_print, questions.print_head_temp],
    diagnose: (answers) => {
      const causes: { cause: string; likelihood: number }[] = [];
      
      if (answers.test_print === 'yes') {
        causes.push({ cause: 'Driver or software configuration issue', likelihood: 85 });
      } else {
        causes.push({ cause: 'Print head damage or debris', likelihood: 70 });
      }
      
      if (answers.recent_changes === 'yes') {
        causes.push({ cause: 'Incompatible driver update', likelihood: 75 });
      }
      
      if (answers.print_head_temp === 'hot') {
        causes.push({ cause: 'Overheating - needs cooling', likelihood: 60 });
      }
      
      causes.push({ cause: 'Character set/encoding mismatch', likelihood: 50 });
      
      return {
        causes: causes.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3),
        steps: [
          '1. Run self-test print to isolate hardware vs software',
          '2. Check printer driver settings match the printer model',
          '3. Verify character encoding is set to UTF-8 or correct codepage',
          '4. Clean print head with isopropyl alcohol and lint-free cloth',
          '5. Reinstall printer driver if self-test works',
        ],
        escalation: 'If self-test also garbled, the print head may be damaged and need replacement.',
        confidence: Math.max(...causes.map(c => c.likelihood)) / 100,
        reasoning: 'Garbled output is typically caused by driver misconfiguration when hardware self-test works correctly.',
      };
    },
  },
  
  paper_jam: {
    questions: [questions.paper_loaded, questions.cutter_sound],
    diagnose: (answers) => {
      const causes: { cause: string; likelihood: number }[] = [];
      
      if (answers.cutter_sound === 'grinding') {
        causes.push({ cause: 'Paper stuck in cutter mechanism', likelihood: 90 });
      }
      
      causes.push({ cause: 'Paper loaded incorrectly', likelihood: 70 });
      causes.push({ cause: 'Paper roll too tight', likelihood: 50 });
      causes.push({ cause: 'Debris in paper path', likelihood: 45 });
      
      return {
        causes: causes.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3),
        steps: [
          '1. Power off the printer',
          '2. Open cover and gently remove any visible paper',
          '3. Check cutter mechanism for stuck paper fragments',
          '4. Use compressed air to clear paper path',
          '5. Reload paper ensuring it feeds smoothly',
          '6. Power on and run a test print',
        ],
        escalation: 'If jams are frequent, the cutter blade may be misaligned and need professional adjustment.',
        confidence: Math.max(...causes.map(c => c.likelihood)) / 100,
        reasoning: 'Paper jams are usually mechanical - stuck paper or debris in the feed path.',
      };
    },
  },
  
  cuts_not_working: {
    questions: [questions.cutter_sound, questions.recent_changes],
    diagnose: (answers) => {
      const causes: { cause: string; likelihood: number }[] = [];
      
      if (answers.cutter_sound === 'no') {
        causes.push({ cause: 'Cutter mechanism disabled in settings', likelihood: 70 });
        causes.push({ cause: 'Cutter motor failure', likelihood: 50 });
      } else if (answers.cutter_sound === 'grinding') {
        causes.push({ cause: 'Dull or damaged cutter blade', likelihood: 80 });
      }
      
      if (answers.recent_changes === 'yes') {
        causes.push({ cause: 'Auto-cutter disabled in driver update', likelihood: 60 });
      }
      
      return {
        causes: causes.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3),
        steps: [
          '1. Check printer settings - ensure auto-cutter is enabled',
          '2. Check driver settings for cut options',
          '3. Run self-test to verify cutter activates',
          '4. Clear any paper debris around cutter',
          '5. If grinding, clean the blade carefully',
        ],
        escalation: 'If cutter motor has failed, the printer will need service or replacement.',
        confidence: Math.max(...causes.map(c => c.likelihood)) / 100,
        reasoning: 'Auto-cutter issues are often configuration-related, but may indicate blade wear.',
      };
    },
  },
  
  slow_printing: {
    questions: [questions.print_head_temp, questions.network_cable, questions.recent_changes],
    diagnose: (answers) => {
      const causes: { cause: string; likelihood: number }[] = [];
      
      if (answers.print_head_temp === 'hot') {
        causes.push({ cause: 'Thermal throttling due to high volume', likelihood: 80 });
      }
      
      causes.push({ cause: 'Network congestion', likelihood: 60 });
      causes.push({ cause: 'High print density settings', likelihood: 50 });
      causes.push({ cause: 'Driver buffer issues', likelihood: 40 });
      
      return {
        causes: causes.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3),
        steps: [
          '1. Allow printer to cool if hot',
          '2. Check network speed - use wired connection if possible',
          '3. Reduce print density/darkness in settings',
          '4. Increase driver buffer size',
          '5. Avoid printing large graphics',
        ],
        escalation: 'Persistent slow printing may indicate network infrastructure issues.',
        confidence: Math.max(...causes.map(c => c.likelihood)) / 100,
        reasoning: 'Slow printing is often tied to thermal management or network speed.',
      };
    },
  },
  
  faded_prints: {
    questions: [questions.paper_type, questions.print_head_temp],
    diagnose: (answers) => {
      const causes: { cause: string; likelihood: number }[] = [];
      
      if (answers.paper_type !== 'thermal') {
        causes.push({ cause: 'Wrong paper type', likelihood: 90 });
      }
      
      causes.push({ cause: 'Old or low-quality thermal paper', likelihood: 70 });
      causes.push({ cause: 'Print density set too low', likelihood: 60 });
      causes.push({ cause: 'Print head wear', likelihood: 40 });
      
      return {
        causes: causes.sort((a, b) => b.likelihood - a.likelihood).slice(0, 3),
        steps: [
          '1. Verify using correct thermal paper',
          '2. Try a fresh roll of quality paper',
          '3. Increase print density in settings',
          '4. Clean print head',
          '5. Check paper storage - avoid heat/sunlight',
        ],
        escalation: 'If fading persists with new paper and high density, print head may need replacement.',
        confidence: Math.max(...causes.map(c => c.likelihood)) / 100,
        reasoning: 'Faded prints are usually caused by paper quality or density settings.',
      };
    },
  },
};

// Symptom display info
export const symptomInfo: Record<Symptom, { label: string; icon: string; description: string }> = {
  printer_offline: { label: 'Printer Offline', icon: '📵', description: 'Printer not responding or showing as disconnected' },
  blank_prints: { label: 'Blank Prints', icon: '📄', description: 'Paper comes out but nothing is printed' },
  garbled_text: { label: 'Garbled Text', icon: '🔠', description: 'Printout shows random characters or gibberish' },
  paper_jam: { label: 'Paper Jam', icon: '📃', description: 'Paper stuck and not feeding correctly' },
  cuts_not_working: { label: 'Cuts Not Working', icon: '✂️', description: 'Auto-cutter not cutting receipts' },
  slow_printing: { label: 'Slow Printing', icon: '🐌', description: 'Prints taking too long to complete' },
  faded_prints: { label: 'Faded Prints', icon: '👻', description: 'Text is light or barely visible' },
};

// Get questions for a symptom
export function getQuestionsForSymptom(symptom: Symptom): Question[] {
  return diagnosisPaths[symptom]?.questions || [];
}

// Run diagnosis
export function diagnose(symptom: Symptom, answers: Record<string, string>): DiagnosisResult {
  const path = diagnosisPaths[symptom];
  if (!path) {
    return {
      causes: [{ cause: 'Unknown issue', likelihood: 50 }],
      steps: ['Contact technical support for further assistance.'],
      confidence: 0.5,
      reasoning: 'Unable to diagnose this symptom.',
    };
  }
  return path.diagnose(answers);
}
