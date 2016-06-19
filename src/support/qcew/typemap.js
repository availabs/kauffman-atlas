export const typemap = {
    employment: [
      'month1_emplvl', // The lq_* versions are used as well
      'month2_emplvl',
      'month3_emplvl'
    ],
    establishment: [
      'qtrly_estabs_count'
    ],
    totalwages: [
      'total_qtrly_wages'
    ],
    contributions: [
      'qtrly_contributions' //not used
    ],
    taxablewages: [
      'taxable_qtrly_wages' // not used
    ],
    avgweekwages: [
      'avg_wkly_wage' // not used
    ],
    cluster: [
      [
        'month1_emplvl',
        'month2_emplvl',
        'month3_emplvl'
      ],
	    [
        'qtrly_estabs_count'
      ],
      [
        'total_qtrly_wages'
      ]
    ],
}
