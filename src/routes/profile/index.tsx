import { component$, $, useSignal } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, zod$, z } from '@builder.io/qwik-city';
import { LuSave } from '@qwikest/icons/lucide';
import { tursoClient } from '~/utils/turso';
import { getUserId, verifyAuth } from '~/utils/auth';

// Data for select dropdowns
const communities = [
  'Andalucía', 'Aragón', 'Cantabria', 'Castilla La Mancha', 'Castilla y León',
  'Cataluña', 'Comunidad de Madrid', 'Comunidad Valenciana', 'Extremadura', 
  'Galicia', 'Islas Baleares', 'Islas Canarias', 'La Rioja', 'Navarra',
  'País Vasco', 'Principado de Asturias', 'Región de Murcia'
];

// Map of provinces by community
const provincesByRegion: Record<string, string[]> = {
  'Andalucía': ['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla'],
  'Aragón': ['Huesca', 'Teruel', 'Zaragoza'],
  'Cantabria': ['Cantabria'],
  'Castilla La Mancha': ['Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo'],
  'Castilla y León': ['Ávila', 'Burgos', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora'],
  'Cataluña': ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
  'Comunidad de Madrid': ['Madrid'],
  'Comunidad Valenciana': ['Alicante', 'Castellón', 'Valencia'],
  'Extremadura': ['Badajoz', 'Cáceres'],
  'Galicia': ['A Coruña', 'Lugo', 'Ourense', 'Pontevedra'],
  'Islas Baleares': ['Baleares'],
  'Islas Canarias': ['Las Palmas', 'Santa Cruz de Tenerife'],
  'La Rioja': ['La Rioja'],
  'Navarra': ['Navarra'],
  'País Vasco': ['Álava', 'Guipúzcoa', 'Vizcaya'],
  'Principado de Asturias': ['Asturias'],
  'Región de Murcia': ['Murcia']
};

const professions = [
  'Administrativo', 'Abogado', 'Arquitecto', 'Contable', 'Desarrollador', 
  'Diseñador', 'Enfermero', 'Médico', 'Profesor', 'Técnico'
];

const contractTypes = ['Indefinido', 'Temporal', 'Por obra o servicio', 'En prácticas', 'Formación'];
const probationOptions = ['Sí', 'No'];
const workScheduleTypes = ['Completa', 'Parcial', 'Intensiva', 'Flexible'];
const sectors = [
  'Administración y gestión', 'Agricultura', 'Comercio y marketing', 
  'Construcción', 'Educación', 'Hostelería y turismo', 'Informática y comunicaciones',
  'Sanidad', 'Servicios socioculturales', 'Transporte y logística'
];
const contributionGroups = [
  'Grupo 1: Ingenieros y Licenciados', 
  'Grupo 2: Ingenieros técnicos, Peritos', 
  'Grupo 3: Jefes administrativos', 
  'Grupo 4: Ayudantes no titulados',
  'Grupo 5: Oficiales administrativos',
  'Grupo 6: Subalternos',
  'Grupo 7: Auxiliares administrativos'
];

// Define our form schema using Zod
const contractFormSchema = z.object({
  community: z.string().min(1, "Por favor seleccione una comunidad"),
  province: z.string().min(1, "Por favor seleccione una provincia"),
  profession: z.string().min(1, "Por favor seleccione una profesión"),
  contractStartDate: z.string().min(1, "Por favor ingrese la fecha de inicio"),
  contractEndDate: z.string().optional(),
  contractType: z.string().min(1, "Por favor seleccione un tipo de contrato"),
  probationPeriod: z.string().min(1, "Por favor indique si hay periodo de prueba"),
  workScheduleType: z.string().min(1, "Por favor seleccione un tipo de jornada"),
  weeklyHours: z.string().optional(),
  netSalary: z.string().optional(),
  grossSalary: z.string().optional(),
  extraPayments: z.string().optional(),
  sector: z.string().optional(),
  contributionGroup: z.string().optional()
});

// Map DB data to form fields
const mapDBToFormFields = (data: any) => {
  return {
    community: data?.community || '',
    province: data?.province || '',
    profession: data?.profession || '',
    contractStartDate: data?.contract_start_date || '',
    contractEndDate: data?.contract_end_date || '',
    contractType: data?.contract_type || '',
    probationPeriod: data?.probation_period || '',
    workScheduleType: data?.work_schedule_type || '',
    weeklyHours: data?.weekly_hours?.toString() || '',
    netSalary: data?.net_salary?.toString() || '',
    grossSalary: data?.gross_salary?.toString() || '',
    extraPayments: data?.extra_payments || '',
    sector: data?.sector || '',
    contributionGroup: data?.contribution_group || ''
  };
};

// Map form fields to database fields
const mapFormToDatabaseFields = (formData: z.infer<typeof contractFormSchema>) => {
  return {
    community: formData.community,
    province: formData.province,
    profession: formData.profession,
    contract_start_date: formData.contractStartDate,
    contract_end_date: formData.contractEndDate || null,
    contract_type: formData.contractType,
    probation_period: formData.probationPeriod,
    work_schedule_type: formData.workScheduleType,
    weekly_hours: formData.weeklyHours ? parseInt(formData.weeklyHours) : null,
    net_salary: formData.netSalary ? parseFloat(formData.netSalary) : null,
    gross_salary: formData.grossSalary ? parseFloat(formData.grossSalary) : null,
    extra_payments: formData.extraPayments || null,
    sector: formData.sector || null,
    contribution_group: formData.contributionGroup || null
  };
};

// Route loader to verify authentication and load existing contract data
export const useContractData = routeLoader$(async (requestEvent) => {
  // Add cache busting parameter to force fresh data on every load
  requestEvent.cacheControl({
    // Disable caching completely by setting max-age to 0
    maxAge: 0,
    // Prevent caching in shared caches like CDNs
    staleWhileRevalidate: 0,
    // Don't store the response in any cache
    noStore: true,
  });

  // Verify authentication
  const isAuthenticated = await verifyAuth(requestEvent);
  if (!isAuthenticated) {
    throw requestEvent.redirect(302, '/auth');
  }
  
  const userId = getUserId(requestEvent);
  if (!userId) {
    return {
      community: '',
      province: '',
      profession: '',
      contractStartDate: '',
      contractEndDate: '',
      contractType: '',
      probationPeriod: '',
      workScheduleType: '',
      weeklyHours: '',
      netSalary: '',
      grossSalary: '',
      extraPayments: '',
      sector: '',
      contributionGroup: ''
    };
  }
  
  const client = tursoClient(requestEvent);
  
  try {
    // Fetch existing contract data if it exists
    const contractResult = await client.execute({
      sql: `SELECT * FROM contract_details WHERE user_id = ?`,
      args: [userId]
    });
    
    if (contractResult.rows.length > 0) {
      // Map DB fields to form fields
      return mapDBToFormFields(contractResult.rows[0]);
    }
    
    // Return empty form if no contract data found
    return {
      community: '',
      province: '',
      profession: '',
      contractStartDate: '',
      contractEndDate: '',
      contractType: '',
      probationPeriod: '',
      workScheduleType: '',
      weeklyHours: '',
      netSalary: '',
      grossSalary: '',
      extraPayments: '',
      sector: '',
      contributionGroup: ''
    };
  } catch (error) {
    console.error('[CONTRACT-LOAD] Error loading contract data:', error);
    return {
      community: '',
      province: '',
      profession: '',
      contractStartDate: '',
      contractEndDate: '',
      contractType: '',
      probationPeriod: '',
      workScheduleType: '',
      weeklyHours: '',
      netSalary: '',
      grossSalary: '',
      extraPayments: '',
      sector: '',
      contributionGroup: ''
    };
  }
});

// Action to save contract data
export const useContractAction = routeAction$(
  async (values, requestEvent) => {
    const userId = getUserId(requestEvent);
    if (!userId) {
      throw requestEvent.redirect(302, '/auth');
    }
    
    const client = tursoClient(requestEvent);
    
    try {
      // Check if contract data already exists for the user
      const existingResult = await client.execute({
        sql: `SELECT id FROM contract_details WHERE user_id = ?`,
        args: [userId]
      });
      
      // Map form data to database fields
      const dbData = mapFormToDatabaseFields(values);
      
      if (existingResult.rows.length > 0) {
        // Get the contract ID from the result
        const contractId = existingResult.rows[0].id;
        
        // Update existing contract data
        await client.execute({
          sql: `UPDATE contract_details SET
            community = ?,
            province = ?,
            profession = ?,
            contract_start_date = ?,
            contract_end_date = ?,
            contract_type = ?,
            probation_period = ?,
            work_schedule_type = ?,
            weekly_hours = ?,
            net_salary = ?,
            gross_salary = ?,
            extra_payments = ?,
            sector = ?,
            contribution_group = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?`,
          args: [
            dbData.community,
            dbData.province,
            dbData.profession,
            dbData.contract_start_date,
            dbData.contract_end_date,
            dbData.contract_type,
            dbData.probation_period,
            dbData.work_schedule_type,
            dbData.weekly_hours,
            dbData.net_salary,
            dbData.gross_salary,
            dbData.extra_payments,
            dbData.sector,
            dbData.contribution_group,
            contractId,
            userId
          ]
        });
      } else {
        // Insert new contract data
        await client.execute({
          sql: `INSERT INTO contract_details (
            user_id, community, province, profession, contract_start_date, 
            contract_end_date, contract_type, probation_period, work_schedule_type, 
            weekly_hours, net_salary, gross_salary, extra_payments, sector, contribution_group
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId,
            dbData.community,
            dbData.province,
            dbData.profession,
            dbData.contract_start_date,
            dbData.contract_end_date,
            dbData.contract_type,
            dbData.probation_period,
            dbData.work_schedule_type,
            dbData.weekly_hours,
            dbData.net_salary,
            dbData.gross_salary,
            dbData.extra_payments,
            dbData.sector,
            dbData.contribution_group
          ]
        });
      }
      
      return {
        status: 'success',
        message: 'Datos del contrato guardados correctamente'
      };
    } catch (error) {
      console.error('[CONTRACT-SAVE] Error saving contract data:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error saving contract data'
      };
    }
  },
  zod$(contractFormSchema)
);

export default component$(() => {
  const contractData = useContractData();
  const contractAction = useContractAction();
  
  // Create local state to track the selected community
  const selectedCommunity = useSignal(contractData.value.community);
  
  // Handle automatic province reset when community changes
  const handleCommunityChange = $(async (event: Event) => {
    const select = event.target as HTMLSelectElement;
    const communityValue = select.value;
    
    // Update the selected community
    selectedCommunity.value = communityValue;
    
    // Get the province select element
    const provinceSelect = document.getElementById('province') as HTMLSelectElement;
    if (provinceSelect) {
      // Reset province value when community changes
      provinceSelect.value = '';
    }
  });

  return (
    <div class="container mx-auto py-8 px-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Datos de tu Contrato Laboral</h1>
        
        {contractAction.value?.status === 'success' && (
          <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            {contractAction.value.message}
          </div>
        )}
        
        {contractAction.value?.status === 'error' && (
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {contractAction.value.message}
          </div>
        )}
        
        <Form action={contractAction} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comunidad Autónoma */}
            <div>
              <label for="community" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comunidad Autónoma
              </label>
              <select
                id="community"
                name="community"
                value={selectedCommunity.value || contractData.value.community}
                onChange$={handleCommunityChange}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled selected={!contractData.value.community}>Seleccione una comunidad</option>
                {communities.map((community) => (
                  <option key={community} value={community}>{community}</option>
                ))}
              </select>
              {contractAction.value?.fieldErrors?.community && (
                <div class="mt-1 text-red-600 dark:text-red-400 text-sm">{contractAction.value.fieldErrors.community}</div>
              )}
            </div>
            
            {/* Provincia */}
            <div>
              <label for="province" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Provincia
              </label>
              <select
                id="province"
                name="province"
                value={contractData.value.province}
                disabled={!selectedCommunity.value}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <option value="" disabled selected={!contractData.value.province}>
                  {selectedCommunity.value ? 'Seleccione una provincia' : 'Primero seleccione una comunidad'}
                </option>
                {selectedCommunity.value && provincesByRegion[selectedCommunity.value]?.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {contractAction.value?.fieldErrors?.province && (
                <div class="mt-1 text-red-600 dark:text-red-400 text-sm">{contractAction.value.fieldErrors.province}</div>
              )}
            </div>
            
            {/* Profesión */}
            <div>
              <label for="profession" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profesión
              </label>
              <select
                id="profession"
                name="profession"
                value={contractData.value.profession}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled selected={!contractData.value.profession}>Seleccione una profesión</option>
                {professions.map((profession) => (
                  <option key={profession} value={profession}>{profession}</option>
                ))}
              </select>
              {contractAction.value?.fieldErrors?.profession && (
                <div class="mt-1 text-red-600 dark:text-red-400 text-sm">{contractAction.value.fieldErrors.profession}</div>
              )}
            </div>
            
            {/* Fecha de inicio del contrato */}
            <div>
              <label for="contractStartDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de inicio del contrato
              </label>
              <input
                id="contractStartDate"
                name="contractStartDate"
                type="date"
                value={contractData.value.contractStartDate}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {contractAction.value?.fieldErrors?.contractStartDate && (
                <div class="mt-1 text-red-600 dark:text-red-400 text-sm">{contractAction.value.fieldErrors.contractStartDate}</div>
              )}
            </div>
            
            {/* Fecha de finalización del contrato */}
            <div>
              <label for="contractEndDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de finalización del contrato
              </label>
              <input
                id="contractEndDate"
                name="contractEndDate"
                type="date"
                value={contractData.value.contractEndDate}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Dejar en blanco para contratos indefinidos
              </p>
            </div>
            
            {/* Tipo de contrato */}
            <div>
              <label for="contractType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de contrato
              </label>
              <select
                id="contractType"
                name="contractType"
                value={contractData.value.contractType}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled selected={!contractData.value.contractType}>Seleccione tipo de contrato</option>
                {contractTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {contractAction.value?.fieldErrors?.contractType && (
                <div class="mt-1 text-red-600 dark:text-red-400 text-sm">{contractAction.value.fieldErrors.contractType}</div>
              )}
            </div>
            
            {/* Periodo de prueba */}
            <div>
              <label for="probationPeriod" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Periodo de prueba
              </label>
              <select
                id="probationPeriod"
                name="probationPeriod"
                value={contractData.value.probationPeriod}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled selected={!contractData.value.probationPeriod}>¿Tiene periodo de prueba?</option>
                {probationOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {contractAction.value?.fieldErrors?.probationPeriod && (
                <div class="mt-1 text-red-600 dark:text-red-400 text-sm">{contractAction.value.fieldErrors.probationPeriod}</div>
              )}
            </div>
            
            {/* Tipo de jornada */}
            <div>
              <label for="workScheduleType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de jornada
              </label>
              <select
                id="workScheduleType"
                name="workScheduleType"
                value={contractData.value.workScheduleType}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled selected={!contractData.value.workScheduleType}>Seleccione tipo de jornada</option>
                {workScheduleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {contractAction.value?.fieldErrors?.workScheduleType && (
                <div class="mt-1 text-red-600 dark:text-red-400 text-sm">{contractAction.value.fieldErrors.workScheduleType}</div>
              )}
            </div>
            
            {/* Horas semanales */}
            <div>
              <label for="weeklyHours" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horas semanales
              </label>
              <input
                id="weeklyHours"
                name="weeklyHours"
                type="number"
                min="1"
                max="60"
                value={contractData.value.weeklyHours}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Salario Neto */}
            <div>
              <label for="netSalary" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salario Neto
              </label>
              <div class="relative">
                <input
                  id="netSalary"
                  name="netSalary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={contractData.value.netSalary}
                  class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-7"
                />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span class="text-gray-500">€</span>
                </div>
              </div>
            </div>
            
            {/* Salario Bruto */}
            <div>
              <label for="grossSalary" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salario Bruto
              </label>
              <div class="relative">
                <input
                  id="grossSalary"
                  name="grossSalary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={contractData.value.grossSalary}
                  class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-7"
                />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span class="text-gray-500">€</span>
                </div>
              </div>
            </div>
            
            {/* Pagas Extras */}
            <div>
              <label for="extraPayments" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pagas Extras
              </label>
              <input
                id="extraPayments"
                name="extraPayments"
                type="text"
                value={contractData.value.extraPayments}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Sector / Sindicato */}
            <div>
              <label for="sector" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sector / Sindicato
              </label>
              <select
                id="sector"
                name="sector"
                value={contractData.value.sector}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled selected={!contractData.value.sector}>Seleccione un sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            
            {/* Grupo de Cotización */}
            <div>
              <label for="contributionGroup" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grupo de Cotización
              </label>
              <select
                id="contributionGroup"
                name="contributionGroup"
                value={contractData.value.contributionGroup}
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled selected={!contractData.value.contributionGroup}>Seleccione grupo de cotización</option>
                {contributionGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div class="flex justify-end mt-8">
            <button
              type="submit"
              class="py-3 px-8 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <LuSave class="w-5 h-5 mr-2" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});