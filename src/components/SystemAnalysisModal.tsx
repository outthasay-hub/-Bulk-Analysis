import React from 'react';
import { Language } from '../utils/i18n';
import { 
  X, 
  Cpu, 
  ShieldCheck, 
  TrendingDown, 
  Table, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const SystemAnalysisModal: React.FC<AnalysisModalProps> = ({ 
  isOpen, 
  onClose,
  lang = 'lo'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full my-auto max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {lang === 'th' ? 'บทวิเคราะห์ระบบตรวจสอบออกซิเจนเหลว (System Analysis)' :
                 lang === 'en' ? 'Liquid Oxygen Bulk Monitoring System Analysis' :
                 'ບົດວິເຄາະລະບົບກວດສອບອົກຊີແຫຼວ (System Analysis)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'th' ? 'การวิเคราะห์ขั้นตอน, สูตรคำนวณ, กฎการตรวจสอบ และการออกแบบ Mobile-First' :
                 lang === 'en' ? 'Workflow analysis, mathematical formulas, automated verification rules, and mobile-first UX' :
                 'ການວິເຄາະຂັ້ນຕອນ, ສູດຄິດໄລ່, ກົດການກວດສອບ ແລະ ການອອກແບບ Mobile-First'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm">
          {/* Section 1: Overview & Problem Statement */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>
                {lang === 'th' ? '1. ปัญหาและความท้าทายหน้างาน (Problem Statement)' :
                 lang === 'en' ? '1. Problem Statement & Industrial Reality' :
                 '1. ຄວາມເປັນມາ ແລະ ບັນຫາຂອງລະບົບ (Problem Statement)'}
              </span>
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs leading-relaxed">
              <p>
                {lang === 'th' ? (
                  <><strong>ถังบรรจุออกซิเจนเหลว Bulk Cryogenic Tank รุ่น CFL(P)-20</strong> ไม่สามารถยกชั่งน้ำหนักตรงๆ บนตาชั่งได้ ในการทำงานจริงเจ้าหน้าที่ต้องปฏิบัติการดังนี้:</>
                ) : lang === 'en' ? (
                  <><strong>Cryogenic Bulk Liquid Oxygen Tank Model CFL(P)-20</strong> cannot be weighed directly on ground scales. Operators must execute the following physical inspection routine:</>
                ) : (
                  <><strong>ຖັງບັນຈຸອົກຊີແຫຼວຂະໜາດໃຫຍ່ (Cryogenic Bulk Tank CFL(P)-20)</strong> ບໍ່ສາມາດຍົກຊັ່ງນ້ຳໜັກໂດຍກົງໄດ້. ໃນພາກປະຕິບັດ, ວິສະວະກອນ/ພະນັກງານຈະຕ້ອງ:</>
                )}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                {lang === 'th' ? (
                  <>
                    <li>อ่านค่าจาก <strong>เกจวัดความดันแตกต่าง (CYJ Differential Pressure Gauge)</strong> หน่วยเป็น mmH₂O หรือ kPa (ช่วง 0 – 10,000 mmH₂O)</li>
                    <li>อ่านค่า <strong>ความดันแก๊สในถัง (Tank Pressure)</strong> จากเกจตัวบน หน่วย MPa (ช่วง 0 – 2.5 MPa)</li>
                    <li>นำค่า mmH₂O ไปเปิด <strong>ตารางเทียบค่า (Calibration Table)</strong> ของถัง CFL(P)-20 (Yangzhou Giant Machinery) เพื่อแปลงเป็น <strong>ปริมาตร (ลิตร)</strong> และ <strong>น้ำหนัก (kg)</strong> ที่ความหนาแน่น 1,140 kg/m³</li>
                    <li>นำน้ำหนักวันนี้ไปลบกับน้ำหนักวันก่อน เพื่อหา <strong>&ldquo;ปริมาณการใช้จริงรายวัน (Net Daily Consumption)&rdquo;</strong></li>
                  </>
                ) : lang === 'en' ? (
                  <>
                    <li>Read the <strong>CYJ Differential Pressure Level Gauge</strong> in mmH₂O or kPa (0 – 10,000 mmH₂O range)</li>
                    <li>Read the <strong>Tank Gas Pressure Gauge</strong> on top in MPa (0 – 2.5 MPa range)</li>
                    <li>Look up the reading in the <strong>CFL(P)-20 Calibration Table</strong> (Yangzhou Giant Machinery) to calculate <strong>Volume (L)</strong> and <strong>Weight (kg)</strong> at density 1,140 kg/m³</li>
                    <li>Subtract today's weight from previous weight to compute <strong>Net Daily Consumption (kg)</strong></li>
                  </>
                ) : (
                  <>
                    <li>ອ່ານຄ່າຈາກ <strong>ມາດວັດລະດັບຄວາມດັນແຕກຕ່າງ (Differential Gauge CYJ)</strong> ໜ່ວຍເປັນ mmH₂O ຫຼື kPa</li>
                    <li>ອ່ານຄ່າ <strong>ຄວາມດັນຖັງ (Tank Pressure)</strong> ຈາກມາດວັດດ້ານເທິງ (MPa)</li>
                    <li>ນຳຄ່າ mmH₂O ໄປເປີດ <strong>ຕາຕະລາງສົມທຽບ (Calibration Table)</strong> ຂອງຜູ້ຜະລິດຖັງ Yangzhou Giant Machinery Co., Ltd ເພື່ອປ່ຽນເປັນ <strong>ບໍລິມາດ (ລິດ)</strong> ແລະ <strong>ນ້ຳໜັກ (kg)</strong> ທີ່ຄວາມໜາແໜ້ນ 1,140 kg/m³</li>
                    <li>ນຳນ້ຳໜັກວັນນີ້ ໄປລົບກັບນ້ຳໜັກມື້ວານ ເພື່ອຫາ <strong>&ldquo;ບໍລິມາດຊົມໃຊ້ຈິງ (Daily Consumption)&rdquo;</strong></li>
                  </>
                )}
              </ul>
              <p className="text-amber-700 dark:text-amber-400 font-medium pt-1">
                {lang === 'th' ? 
                  '⚠️ ปัญหาเดิม: การเปิดตารางกระดาษคลาดเคลื่อนเมื่อค่าอยู่กึ่งกลาง, ลืมบันทึกการเติมก๊าซจากรถ Tanker ทำให้คำนวณการใช้ติดลบ, และไม่มีการแจ้งเตือนความดันถังผิดปกติ' :
                 lang === 'en' ? 
                  '⚠️ Common Pitfalls: Manual paper table lookup rounding errors, unrecorded tanker refills causing negative consumption spikes, and lack of automated overpressure safety alerts.' :
                  '⚠️ ບັນຫາທີ່ພົບເລື້ອຍ: ການອ່ານມາດວັດຄາດເຄື່ອນ, ການເປີດຕາຕະລາງຜິດພາດເມື່ອຄ່າຕົກລະຫວ່າງກາງ (interpolations), ການລືມບວກຍອດເຕີມກ໊າຊ, ແລະ ບໍ່ມີລະບົບເຕືອນໄພອັດຕະໂນມັດ.'}
              </p>
            </div>
          </div>

          {/* Section 2: Mathematical Engine & Interpolation */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
              <Table className="w-4 h-4" />
              <span>
                {lang === 'th' ? '2. สูตรการคำนวณทางคณิตศาสตร์ (Mathematical Formulation)' :
                 lang === 'en' ? '2. Mathematical Formulation & Interpolation' :
                 '2. ສູດຄະນິດສາດ ແລະ ການຄິດໄລ່ສົມທຽບ (Mathematical Formulation)'}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  {lang === 'th' ? 'ก. สูตรเทียบค่าเชิงเส้น (Linear Interpolation)' :
                   lang === 'en' ? 'A. Linear Interpolation Formula' :
                   'ກ. ສູດຄິດໄລ່ສົມທຽບເສັ້ນຊື່ (Linear Interpolation)'}
                </div>
                <div className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-cyan-700 dark:text-cyan-300">
                  W = W₁ + [ (L - L₁) / (L₂ - L₁) ] × (W₂ - W₁)
                </div>
                <p className="text-slate-500">
                  {lang === 'th' ? 'L คือค่าเกจที่อ่านได้, [L₁, L₂] คือช่วงอ้างอิงในตาราง CFL(P)-20 (เช่น 5,700 และ 5,750), W₁ และ W₂ คือน้ำหนักอ้างอิง' :
                   lang === 'en' ? 'Where L is the gauge reading, [L1, L2] are bounding table points (e.g. 5,700 and 5,750), and W1, W2 are reference weights.' :
                   'ໂດຍທີ່ L ແມ່ນຄ່າມາດວັດທີ່ອ່ານໄດ້, [L₁, L₂] ແມ່ນຊ່ວງມາດຕະຖານໃນຕາຕະລາງ, W₁ ແລະ W₂ ແມ່ນນ້ຳໜັກອ້າງອີງ.'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  {lang === 'th' ? 'ข. สูตรคำนวณปริมาณใช้จริง (Net Consumption)' :
                   lang === 'en' ? 'B. Net Daily Consumption Formula' :
                   'ຂ. ສູດຄິດໄລ່ບໍລິມາດຊົມໃຊ້ຈິງ (Net Consumption)'}
                </div>
                <div className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-300">
                  Consumption = W_prev + W_refill - W_curr
                </div>
                <p className="text-slate-500">
                  {lang === 'th' ? 'ตัวอย่างเอกสารจริง: 19,543.4 kg (11/11) - 19,194.4 kg (12/11) = 349.0 kg ถูกต้องตามเอกสารหน้า 1' :
                   lang === 'en' ? 'Real Sample Data: 19,543.4 kg (11/11) - 19,194.4 kg (12/11) = 349.0 kg exactly matching user document page 1.' :
                   'ຕົວຢ່າງ: 19,543.4 kg (11/11) - 19,194.4 kg (12/11) = 349.0 kg ຕົງຕາມເອກະສານຕົວຈິງ.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Verification & Anomaly Detection Rules */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {lang === 'th' ? '3. กฎการตรวจสอบความถูกต้องอัตโนมัติ (Automated Verification Rules)' :
                 lang === 'en' ? '3. Automated Verification Rules & Safety Checks' :
                 '3. ກົດເກນການກວດສອບອັດຕະໂນມັດ (Automated Verification Rules)'}
              </span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    {lang === 'th' ? 'กฎที่ 1: การควบคุมความดันความปลอดภัย (Pressure Safety Envelope)' :
                     lang === 'en' ? 'Rule 1: Tank Pressure Safety Envelope (0.45 – 1.20 MPa)' :
                     'ກົດທີ່ 1: ການຄວບຄຸມແຮງດັນຄວາມປອດໄພ (Pressure Safety Envelope)'}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    {lang === 'th' ? 
                      'ช่วงปกติคือ 0.60 – 1.00 MPa หากสูงเกิน 1.20 MPa ระบบจะแจ้งเตือนสีแดงให้ตรวจสอบ Safety Relief Valve (~1.4 MPa) หากต่ำกว่า 0.45 MPa จะเตือนให้ตรวจชุดสร้างความดัน (PBU)' :
                     lang === 'en' ? 
                      'Normal operating range is 0.60 – 1.00 MPa. If pressure > 1.20 MPa, alerts to inspect the safety relief valve (~1.4 MPa). If < 0.45 MPa, alerts to check the pressure build-up unit (PBU).' :
                      'ແຮງດັນປົກກະຕິຄວນຢູ່ທີ່ 0.60 – 1.00 MPa. ຫາກສູງກວ່າ 1.20 MPa ລະບົບຈະແຈ້ງເຕືອນສີແດງ. ຫາກຕ່ຳກວ່າ 0.45 MPa ຈະແຈ້ງເຕືອນໃຫ້ກວດລະບົບ PBU.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    {lang === 'th' ? 'กฎที่ 2: ตรวจสอบระดับก๊าซเพิ่มขึ้นผิดปกติ (Unrecorded Refill Detection)' :
                     lang === 'en' ? 'Rule 2: Unrecorded Refill Detection (+50 kg threshold)' :
                     'ກົດທີ່ 2: ກວດສອບຍອດກ໊າຊເພີ່ມຂຶ້ນໂດຍບໍ່ມີໃບເຕີມ (Unrecorded Refill Detection)'}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    {lang === 'th' ? 
                      'หากค่าเกจสูงขึ้นกว่าครั้งก่อนเกิน 50 kg โดยไม่มีการบันทึกใบส่งสินค้า ระบบจะแจ้งเตือนพร้อมให้ปุ่มลัดไปยังเมนู "เติมก๊าซ Bulk"' :
                     lang === 'en' ? 
                      'If liquid weight increases by > 50 kg without a recorded delivery docket, the system flags an unrecorded refill and prompts immediate entry.' :
                      'ຫາກຄ່າມາດວັດທີ່ບັນທຶກສູງຂຶ້ນກວ່າຄັ້ງກ່ອນເກີນ 50 kg ໂດຍບໍ່ມີໃບສົ່ງເຄື່ອງ ລະບົບຈະແຈ້ງເຕືອນທັນທີ.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <TrendingDown className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    {lang === 'th' ? 'กฎที่ 3: กระทบยอดใบส่งสินค้า (Delivery Docket Reconciliation)' :
                     lang === 'en' ? 'Rule 3: Tanker Delivery Reconciliation & Flash Loss (±4.0%)' :
                     'ກົດທີ່ 3: ສົມທຽບຍອດຮັບກ໊າຊຈາກລົດ Tanker (Refill Discrepancy Reconciliation)'}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    {lang === 'th' ? 
                      'เปรียบเทียบน้ำหนักสุทธิตามใบส่งสินค้า Linde กับน้ำหนักที่ขึ้นถังจริง โดยยอมรับค่าการระเหยเป็นไอระหว่างต่อสาย (Flash loss) ที่ ±4.0%' :
                     lang === 'en' ? 
                      'Compares Linde docket net weight against physical tank weight gain, allowing up to ±4.0% normal transfer vaporization loss.' :
                      'ນຳຍອດສິນຄ້າຕາມໃບສົ່ງສິນຄ້າ Linde ມາສົມທຽບກັບຍອດນ້ຳໜັກທີ່ເພີ່ມຂຶ້ນໃນຖັງຕົວຈິງ ໂດຍຍອມຮັບສ່ວນຕ່າງການລະເຫີຍບໍ່ເກີນ ±4.0%.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Mobile-First UX Architecture */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>
                {lang === 'th' ? '4. การออกแบบสถาปัตยกรรม UX (Mobile-First & Desktop)' :
                 lang === 'en' ? '4. Responsive UX Architecture (Mobile-First & Desktop)' :
                 '4. ການອອກແບບ UX ສຳລັບມືຖື ແລະ ຄອມພິວເຕີ (Mobile-First & Desktop)'}
              </span>
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {lang === 'th' ? 'การใช้งานบนสมาร์ตโฟน (Mobile View):' :
                     lang === 'en' ? 'Smartphone Experience (Mobile):' :
                     'ເທິງມືຖື (Mobile View):'}
                  </div>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Fixed Bottom Navigation (Thumb Zone) ใช้งานสะดวกด้วยนิ้วโป้งมือเดียว</li>
                    <li>Quick Stepper Buttons (+50, -50, +100 mmH₂O) กดง่าย Touch target &ge; 44px</li>
                    <li>รองรับการเปิดกล้องถ่ายภาพหน้าปัดเกจ CYJ และใบส่งของเพื่อแนบเป็นหลักฐาน</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {lang === 'th' ? 'การใช้งานบนคอมพิวเตอร์ (Desktop View):' :
                     lang === 'en' ? 'Desktop Experience (Computer):' :
                     'ເທິງຄອມພິວເຕີ (Desktop View):'}
                  </div>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>แสดงผลแบบ Multi-column พร้อมแดชบอร์ดสรุปความปลอดภัยครบถ้วน</li>
                    <li>ส่งออกข้อมูลรายงานเป็น Excel (CSV) และพิมพ์รายงาน A4 พร้อมช่องลงนาม</li>
                    <li>ค้นหาตารางเทียบค่า CFL(P)-20 ได้อย่างรวดเร็ว</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-white font-semibold text-xs rounded-xl shadow transition-colors"
          >
            {lang === 'th' ? 'ปิดหน้าต่างบทวิเคราะห์ (Close)' : lang === 'en' ? 'Close Analysis' : 'ເຂົ້າໃຈແລ້ວ (Close Analysis)'}
          </button>
        </div>
      </div>
    </div>
  );
};
