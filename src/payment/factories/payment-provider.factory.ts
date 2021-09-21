import { Injectable } from '@nestjs/common';
import { PaymentProviders } from '../../entities/transaction.entity';
import { IPaymentProvider } from '../interfaces/payment.provider.interface';
import { FlutterwaveService } from '../flutterwave/flutterwave.service';

/**
 * Factory class responsible for returning a collection of provider classes
 */
@Injectable()
export class PaymentProviderFactory {
  repositories: Map<PaymentProviders, IPaymentProvider>;

  constructor(flutterwaveService: FlutterwaveService) {
    if (!this.repositories) {
      this.repositories = new Map<PaymentProviders, IPaymentProvider>();

      this.repositories.set(PaymentProviders.FLUTTERWAVE, flutterwaveService);
    }
  }

  /**
   * Returns all providers in a map
   */
  public all(): Map<PaymentProviders, IPaymentProvider> {
    return this.repositories;
  }

  /**
   * Returns a single provider
   */
  public findOne(providerName: PaymentProviders): IPaymentProvider {
    const provider = this.repositories.get(providerName);

    if (!provider) {
      throw new ReferenceError('Payment provider not found in factory');
    }

    return provider;
  }
}
