using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace RadgeScreen
{
    /// <summary>
    /// Lógica de interacción para MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private Process pDocked;
        private IntPtr hWndOriginalParent;
        private IntPtr hWndDocked;
        private StackPanel mainPanel;

        public const int GWL_EXSTYLE = (-20);
        public const int WS_EX_TRANSPARENT = 0x00000020;

        [DllImport("user32.dll")]
        public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

        [DllImport("user32.dll")]
        public static extern IntPtr SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

        [DllImport("user32.dll")]
        public static extern bool CloseWindow(IntPtr hWnd);

        public MainWindow()
        {
            InitializeComponent();
            this.WindowState = WindowState.Maximized;
            mainPanel = (StackPanel)this.FindName("MainPanel");
        }

        private void button_Click(object sender, EventArgs e)
        {
            if (hWndOriginalParent != IntPtr.Zero) //don't do anything if there's already a window docked.
                return;

            pDocked = new Process();
            // pDocked.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            // pDocked.StartInfo.FileName = Environment.CurrentDirectory + @"radge_screen.exe");
            pDocked.StartInfo.FileName = Environment.CurrentDirectory + @"/../../../screenPack/radge_screen.exe";
            // pDocked.StartInfo.FileName = "notepad.exe";
            // Trace.WriteLine(Environment.CurrentDirectory + @"../screenPack/radge_screen.exe");
            pDocked.Start();
            while (hWndDocked == IntPtr.Zero)
            {
                pDocked.WaitForInputIdle(1000); //wait for the window to be ready for input;
                pDocked.Refresh();              //update process info
                if (pDocked.HasExited)
                {
                    return; //abort if the process finished before we got a handle.
                }
                hWndDocked = pDocked.MainWindowHandle;  //cache the window handle
            }
            //Windows API call to change the parent of the target window.
            //It returns the hWnd of the window's parent prior to this call.
            hWndOriginalParent = SetParent(hWndDocked, Process.GetCurrentProcess().MainWindowHandle);

            SetWindowLong(hWndDocked, GWL_EXSTYLE, WS_EX_TRANSPARENT);

            //Wire up the event to keep the window sized to match the control
            mainPanel.SizeChanged += new SizeChangedEventHandler(MainPanel_Resize);
            //Perform an initial call to set the size.
            MainPanel_Resize(new Object(), new EventArgs());

            this.screenInitButton.Visibility = Visibility.Hidden;
        }

        private void MainPanel_Resize(object sender, EventArgs e)
        {
            //Change the docked windows size to match its parent's size. 
            MoveWindow(hWndDocked, 60 + Convert.ToInt32(mainPanel.ActualWidth / 2), 10, Convert.ToInt32(mainPanel.ActualWidth / 2), Convert.ToInt32(mainPanel.ActualHeight / 2), true);
        }
    }
}
