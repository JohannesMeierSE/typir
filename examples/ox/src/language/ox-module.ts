/******************************************************************************
 * Copyright 2024 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { Module, inject } from 'langium';
import { DefaultSharedModuleContext, LangiumServices, LangiumSharedServices, PartialLangiumServices, createDefaultModule, createDefaultSharedModule } from 'langium/lsp';
import { LangiumServicesForTypirBinding, createLangiumModuleForTypirBinding, initializeLangiumTypirServices } from 'typir-langium';
import { OxGeneratedModule, OxGeneratedSharedModule } from './generated/module.js';
import { createOxTypirModule } from './ox-type-checking.js';
import { OxValidator, registerValidationChecks } from './ox-validator.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type OxAddedServices = {
    validation: {
        OxValidator: OxValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type OxServices = LangiumServices & OxAddedServices & LangiumServicesForTypirBinding

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const OxModule: Module<OxServices, PartialLangiumServices & OxAddedServices> = {
    validation: {
        OxValidator: () => new OxValidator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 * For type checking with Typir, merge two more modules:
 *  - Typir default services
 *  - custom services for OX
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createOxServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Ox: OxServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        OxGeneratedSharedModule
    );
    const Ox = inject(
        createDefaultModule({ shared }),
        OxGeneratedModule,
        OxModule,
        createLangiumModuleForTypirBinding(shared),
        createOxTypirModule(shared),
    );
    shared.ServiceRegistry.register(Ox);
    registerValidationChecks(Ox);
    initializeLangiumTypirServices(Ox);
    return { shared, Ox };
}
