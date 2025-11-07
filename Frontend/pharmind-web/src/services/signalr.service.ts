import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectingPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    // Si ya está conectado, no hacer nada
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Si está en proceso de conexión, esperar a que termine
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    // Si existe una conexión previa en cualquier otro estado, detenerla primero
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        // Ignorar errores al detener una conexión previa
      }
      this.connection = null;
    }

    // Crear nueva conexión
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5209/hubs/import-progress', {
        skipNegotiation: false,
        withCredentials: true
      })
      .configureLogging(signalR.LogLevel.Error) // Solo errores críticos
      .withAutomaticReconnect()
      .build();

    // Manejar eventos de reconexión
    this.connection.onreconnecting(() => {
      // Silencioso - reconectando
    });

    this.connection.onreconnected(() => {
      // Silencioso - reconectado
    });

    this.connection.onclose((error) => {
      if (error) {
        console.error('SignalR connection closed with error:', error);
      }
      this.connectingPromise = null;
    });

    // Iniciar conexión
    this.connectingPromise = this.connection
      .start()
      .then(() => {
        this.connectingPromise = null;
      })
      .catch((error) => {
        // Ignorar errores de AbortError que ocurren durante React Strict Mode
        if (error.name !== 'AbortError' && !error.message?.includes('stopped during negotiation')) {
          console.error('SignalR connection error:', error);
        }
        this.connectingPromise = null;
        // No relanzar el error para evitar uncaught promise rejection
      });

    return this.connectingPromise;
  }

  onImportProgress(callback: (update: any) => void): void {
    if (!this.connection) {
      console.error('SignalR connection not established');
      return;
    }

    this.connection.on('ImportProgress', (update) => {
      callback(update);
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        // Si hay una conexión en progreso, cancelarla primero
        if (this.connectingPromise) {
          this.connectingPromise = null;
        }

        await this.connection.stop();
      } catch (error) {
        // Ignorar errores al desconectar
      }
      this.connection = null;
      this.connectingPromise = null;
    }
  }
}

export const signalRService = new SignalRService();
